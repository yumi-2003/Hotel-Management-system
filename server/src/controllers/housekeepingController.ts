import { Request, Response } from 'express';
import HousekeepingLog, { HousekeepingStatus } from '../models/HousekeepingLog';
import Room, { RoomStatus } from '../models/Room';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Notification, { NotificationType } from '../models/Notification';

export const createHousekeepingLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[DEBUG] createHousekeepingLog Payload:', req.body);
    const { roomId, room, status, note, staffId: providedStaffId, assignedTo } = req.body;
    
    const finalRoomId = roomId || room;
    const finalStaffId = providedStaffId || assignedTo || req.user?.id;
    const finalStatus = status || HousekeepingStatus.DIRTY;

    console.log('[DEBUG] Mapped Fields:', { finalRoomId, finalStaffId, finalStatus, task: req.body.task });

    if (!finalRoomId) {
      res.status(400).json({ message: 'Room ID is required (DEBUG: finalRoomId was empty)' });
      return;
    }

    const log = await HousekeepingLog.create({
      roomId: finalRoomId,
      staffId: finalStaffId,
      status: finalStatus,
      task: req.body.task || 'Routine Cleaning',
      note
    });

    await Room.findByIdAndUpdate(finalRoomId, { status: finalStatus });

    const populatedLog = await HousekeepingLog.findById(log._id)
      .populate('roomId', 'roomNumber floor status')
      .populate('staffId', 'fullName email');

    res.status(201).json(mapLogToFrontend(populatedLog));
  } catch (error) {
    console.error('[DEBUG] createHousekeepingLog Error:', error);
    res.status(500).json({ 
      message: 'Error creating housekeeping log (DEBUG: validation failed in latest code)', 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

// Helper to map backend log to frontend expected structure
const mapLogToFrontend = (log: any) => {
  const logObj = log.toObject ? log.toObject() : log;
  return {
    ...logObj,
    room: logObj.roomId,
    assignedTo: logObj.staffId,
    roomId: undefined,
    staffId: undefined
  };
};

export const assignHousekeepingTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const log = await HousekeepingLog.findById(id);
    if (!log) {
      res.status(404).json({ message: 'Housekeeping log not found' });
      return;
    }

    log.staffId = staffId;
    await log.save();

    // 1. Persist assignment in User model
    await User.findByIdAndUpdate(staffId, {
      $addToSet: { tasksAssigned: log._id }
    });

    // 2. Create Notification for the staff member
    try {
      const roomNumber = (log as any).roomId?.roomNumber || 'unknown';
      const notif = await Notification.create({
        recipient: staffId,
        message: `You have been assigned a new task: ${log.task} for Room ${roomNumber}.`,
        type: NotificationType.ASSIGNMENT,
        link: '/housekeeping/dashboard'
      });
      console.log(`[NOTIFICATION_SUCCESS] Created housekeeping notification for staff ${staffId}: ${notif._id}`);
    } catch (notifErr) {
      console.error(`[NOTIFICATION_ERROR] Failed to create housekeeping notification for staff ${staffId}:`, notifErr);
    }

    const populatedLog = await HousekeepingLog.findById(log._id)
      .populate('roomId', 'roomNumber floor status')
      .populate('staffId', 'fullName email');

    res.json(mapLogToFrontend(populatedLog));
  } catch (error) {
    res.status(500).json({ message: 'Error assigning housekeeping task', error });
  }
};

export const updateHousekeepingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, roomStatus: customRoomStatus } = req.body;

    const log = await HousekeepingLog.findById(id);
    if (!log) {
      res.status(404).json({ message: 'Housekeeping log not found' });
      return;
    }

    log.status = status;
    if (note) log.note = note;
    
    // Ensure task is present to satisfy schema validation
    if (!log.task) {
      log.task = 'Routine Cleaning';
    }

    await log.save();

    // Sync Room Status
    const roomStatusToSet = customRoomStatus || (status === HousekeepingStatus.CLEAN ? RoomStatus.AVAILABLE : RoomStatus.CLEANING);
    await Room.findByIdAndUpdate(log.roomId, { status: roomStatusToSet });

    const populatedLog = await HousekeepingLog.findById(log._id)
      .populate('roomId', 'roomNumber floor status')
      .populate('staffId', 'fullName email');

    res.json(mapLogToFrontend(populatedLog));
  } catch (error) {
    res.status(500).json({ message: 'Error updating housekeeping status', error });
  }
};

export const getHousekeepingLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) {
      query.status = { $in: (status as string).split(',') };
    }

    const logs = await HousekeepingLog.find(query)
      .populate('roomId', 'roomNumber floor status')
      .populate('staffId', 'fullName email')
      .sort({ updatedAt: -1 });

    res.json(logs.map(mapLogToFrontend));
  } catch (error) {
    console.error('Error fetching housekeeping logs:', error);
    res.status(500).json({ message: 'Error fetching housekeeping logs', error });
  }
};
