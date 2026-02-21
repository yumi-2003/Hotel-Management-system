import { Request, Response } from 'express';
import Room from '../models/Room';
import HousekeepingLog from '../models/HousekeepingLog';
import { AuthRequest } from '../middleware/auth';

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
  }
};

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().populate('roomTypeId');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
};

export const updateRoomStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const staffId = req.user?.id;

    const room = await Room.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    
    if (room) {
      // Create a record in housekeeping logs for the status change
      await HousekeepingLog.create({
        roomId: id,
        staffId,
        status,
        note: note || `Status updated to ${status}`
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room status', error });
  }
};
