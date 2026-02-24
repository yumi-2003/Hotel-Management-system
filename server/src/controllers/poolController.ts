import * as express from 'express';
import Pool from '../models/Pool';
import PoolSlot from '../models/PoolSlot';
import PoolReservation, { ReservationStatus } from '../models/PoolReservation';
import User, { UserRole } from '../models/User';
import Notification, { NotificationType } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { format, parse, addHours, isBefore, isAfter } from 'date-fns';

export const getPoolStatus = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const pool = await Pool.findOne().populate('updatedBy', 'fullName');
    if (!pool) {
      res.status(404).json({ message: 'Pool status not found' });
      return;
    }
    res.json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pool status', error });
  }
};

export const updatePoolStatus = async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { status, currentOccupancy, maxCapacity, temperature, openingTime, closingTime, notes } = req.body;
    const userId = req.user?.id;

    let pool = await Pool.findOne();
    const oldStatus = pool?.status;
    
    if (pool) {
      pool.status = status !== undefined ? status : pool.status;
      pool.currentOccupancy = currentOccupancy !== undefined ? currentOccupancy : pool.currentOccupancy;
      pool.maxCapacity = maxCapacity !== undefined ? maxCapacity : pool.maxCapacity;
      pool.temperature = temperature !== undefined ? temperature : pool.temperature;
      pool.openingTime = openingTime !== undefined ? openingTime : pool.openingTime;
      pool.closingTime = closingTime !== undefined ? closingTime : pool.closingTime;
      pool.notes = notes !== undefined ? notes : pool.notes;
      pool.updatedBy = userId as any;
      await pool.save();
    } else {
      pool = await Pool.create({
        status,
        currentOccupancy,
        maxCapacity,
        temperature,
        openingTime,
        closingTime,
        notes,
        updatedBy: userId
      });
    }

    // Notify Housekeeping if status changed to cleaning
    if (status === 'cleaning' && oldStatus !== 'cleaning') {
      const housekeepers = await User.find({ role: UserRole.HOUSEKEEPING, status: 'active' });
      const notifications = housekeepers.map(hk => ({
        recipient: hk._id,
        message: 'The pool requires cleaning. Please check the Pool Management dashboard.',
        type: NotificationType.STATUS_UPDATE,
        link: '/management/pool'
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json(pool);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pool status', error });
  }
};

export const getPoolSlots = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const formattedDate = date as string;
    let slots = await PoolSlot.find({ date: formattedDate }).sort({ startTime: 1 });

    if (slots.length === 0) {
      // Generate slots based on pool opening/closing times
      const pool = await Pool.findOne();
      if (!pool) {
        res.status(404).json({ message: 'Pool configuration not found' });
        return;
      }

      const openTime = pool.openingTime || "08:00";
      const closeTime = pool.closingTime || "22:00";
      const maxCap = pool.maxCapacity || 50;

      const newSlots = [];
      let current = parse(openTime, 'HH:mm', new Date());
      const end = parse(closeTime, 'HH:mm', new Date());

      while (isBefore(current, end)) {
        const next = addHours(current, 1);
        if (isAfter(next, end)) break;

        newSlots.push({
          date: formattedDate,
          startTime: format(current, 'HH:mm'),
          endTime: format(next, 'HH:mm'),
          maxPeople: Math.floor(maxCap / 4), // Example: max 1/4th capacity per slot
          currentReserved: 0
        });
        current = next;
      }

      if (newSlots.length > 0) {
        slots = await PoolSlot.insertMany(newSlots);
      }
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pool slots', error });
  }
};

export const reservePoolSlot = async (req: AuthRequest, res: express.Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { slotId, roomId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Atomically find and increment if capacity exists
      const slot = await PoolSlot.findOneAndUpdate(
        { 
          _id: slotId, 
          $expr: { $lt: ["$currentReserved", "$maxPeople"] } 
        },
        { $inc: { currentReserved: 1 } },
        { session, new: true }
      );

      if (!slot) {
        res.status(400).json({ message: 'Slot is full or not found' });
        return;
      }

      const reservation = await PoolReservation.create([{
        userId,
        roomId,
        slotId,
        status: ReservationStatus.CONFIRMED
      }], { session });

      res.status(201).json(reservation[0]);
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating reservation' });
  } finally {
    session.endSession();
  }
};

export const cancelPoolReservation = async (req: AuthRequest, res: express.Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { id } = req.params;

      const reservation = await PoolReservation.findById(id).session(session);
      if (!reservation || reservation.status === ReservationStatus.CANCELLED) {
        res.status(404).json({ message: 'Reservation not found or already cancelled' });
        return;
      }

      reservation.status = ReservationStatus.CANCELLED;
      await reservation.save({ session });

      // Atomically decrement
      await PoolSlot.findByIdAndUpdate(
        reservation.slotId,
        { $inc: { currentReserved: -1 } },
        { session }
      );

      res.json({ message: 'Reservation cancelled successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error });
  } finally {
    session.endSession();
  }
};
