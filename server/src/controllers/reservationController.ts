import { Request, Response } from 'express';
import Reservation, { ReservationStatus } from '../models/Reservation';
import Booking, { BookingStatus } from '../models/Booking';
import Room, { RoomStatus } from '../models/Room';
import RoomType from '../models/RoomType';
import Notification, { NotificationType } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { getAvailableRooms } from '../utils/availability';
import mongoose from 'mongoose';

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { roomType: roomTypeId, checkInDate: checkInStr, checkOutDate: checkOutStr, adultsCount, childrenCount } = req.body;
    const guestId = req.user?.id;

    if (!guestId) {
      res.status(401).json({ message: 'Unauthorized' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    if (!roomTypeId || !checkInStr || !checkOutStr || adultsCount === undefined) {
      res.status(400).json({ message: 'Missing required fields: roomType, checkInDate, checkOutDate, and adultsCount are required' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    if (checkInDate >= checkOutDate) {
      res.status(400).json({ message: 'Check-out date must be after check-in date' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Get RoomType details
    const roomType = await RoomType.findById(roomTypeId).session(session);
    if (!roomType) {
      res.status(404).json({ message: 'Room type not found' });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // --- Strict Availability Logic with Atomic Validation ---
    const availableRooms = await getAvailableRooms(roomTypeId, checkInDate, checkOutDate);
    
    if (availableRooms.length === 0) {
      res.status(400).json({ message: `No ${roomType.typeName} rooms are available for these dates.` });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const availableRoomId = availableRooms[0]._id;

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Apply discount
    const pricePerNight = roomType.discount > 0 
      ? Math.round(roomType.basePrice * (1 - roomType.discount / 100))
      : roomType.basePrice;
    
    const subtotalAmount = pricePerNight * nights;
    const taxAmount = Math.round(subtotalAmount * 0.15);
    const totalAmount = subtotalAmount + taxAmount;

    const reservationCode = `RES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    // expiresAt: 15 minutes to confirm
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    const reservation = await Reservation.create([{
      reservationCode,
      guestId,
      checkInDate,
      checkOutDate,
      adultsCount,
      childrenCount: childrenCount || 0,
      roomsCount: 1,
      subtotalAmount,
      taxAmount,
      totalAmount,
      expiresAt,
      reservedRooms: [{
        roomId: availableRoomId,
        pricePerNight,
        nights,
        subtotal: subtotalAmount
      }],
      status: ReservationStatus.PENDING
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Create Notification for the guest
    try {
      const notif = await Notification.create({
        recipient: guestId,
        message: `Your reservation ${reservationCode} has been created and is pending confirmation.`,
        type: NotificationType.SYSTEM,
        link: '/my-reservations'
      });
      console.log(`[NOTIFICATION_SUCCESS] Created notification for guest ${guestId}: ${notif._id}`);
    } catch (notifErr) {
      console.error(`[NOTIFICATION_ERROR] Failed to create notification for guest ${guestId}:`, notifErr);
    }

    res.status(201).json(reservation[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create Reservation Error:', error);
    res.status(500).json({ message: 'Error creating reservation', error });
  }
};

const mapReservationToFrontend = (r: any) => {
  const reservationObj = r.toObject ? r.toObject() : r;
  
  // Auto-expiry check
  if (reservationObj.status === ReservationStatus.PENDING && new Date() > new Date(reservationObj.expiresAt)) {
    reservationObj.status = ReservationStatus.EXPIRED;
    // Note: We don't save here to keep it side-effect free in mapping, 
    // but ideally a cleaner/worker handles this.
  }

  return {
    ...reservationObj,
    user: reservationObj.guestId,
    // Extracting roomType info from the first reserved room
    roomType: reservationObj.reservedRooms?.[0]?.roomId?.roomTypeId || null,
    guests: reservationObj.adultsCount + reservationObj.childrenCount
  };
};

export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservations = await Reservation.find({ guestId: req.user?.id })
      .populate({
        path: 'reservedRooms.roomId',
        populate: { path: 'roomTypeId' }
      })
      .sort({ createdAt: -1 });
    
    const mappedReservations = reservations.map(mapReservationToFrontend);
    res.json(mappedReservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error });
  }
};

export const getReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('guestId', 'fullName email')
      .populate({
        path: 'reservedRooms.roomId',
        populate: { path: 'roomTypeId' }
      })
      .sort({ createdAt: -1 });

    const mappedReservations = reservations.map(mapReservationToFrontend);
    res.json(mappedReservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error });
  }
};

export const updateReservationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    ).populate('guestId', 'fullName email')
     .populate({
        path: 'reservedRooms.roomId',
        populate: { path: 'roomTypeId' }
      });

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    // Create Notification for the guest about status update
    try {
      const notif = await Notification.create({
        recipient: (reservation.guestId as any)._id || reservation.guestId,
        message: `Your reservation ${reservation.reservationCode} status has been updated to ${status}.`,
        type: NotificationType.STATUS_UPDATE,
        link: '/my-reservations'
      });
      console.log(`[NOTIFICATION_SUCCESS] Created status update notification for guest ${reservation.guestId}: ${notif._id}`);
    } catch (notifErr) {
      console.error(`[NOTIFICATION_ERROR] Failed to create status update notification for guest ${reservation.guestId}:`, notifErr);
    }

    res.json(mapReservationToFrontend(reservation));
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation status', error });
  }
};
