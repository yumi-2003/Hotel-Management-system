import { Request, Response } from "express";
import Room from "../models/Room";
import HousekeepingLog from "../models/HousekeepingLog";
import { AuthRequest } from "../middleware/auth";
import { RoomStatus } from "../types/enums";

export const createRoom = async (
  req: Request,
  res: Response,
  ): Promise<void> => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error creating room", error });
  }
};

export const createMultipleRooms = async (
  req: Request,
  res: Response,
  ): Promise<void> => {
  try {
    const { roomTypeId, count, startRoomNumber, floor } = req.body;

    const parsedCount = Number.parseInt(count, 10);
    const parsedStartRoomNumber = Number.parseInt(startRoomNumber, 10);
    const parsedFloor = Number.parseInt(floor, 10);

    if (!roomTypeId || !count || !startRoomNumber) {
      res.status(400).json({ message: "roomTypeId, count, and startRoomNumber are required" });
      return;
    }

    if (
      Number.isNaN(parsedCount) ||
      parsedCount < 1 ||
      Number.isNaN(parsedStartRoomNumber) ||
      parsedStartRoomNumber < 1 ||
      Number.isNaN(parsedFloor) ||
      parsedFloor < 1
    ) {
      res.status(400).json({
        message: "count, startRoomNumber, and floor must be positive numbers",
      });
      return;
    }

    const createdRooms = [];
    const skippedRoomNumbers: string[] = [];

    for (let i = 0; i < parsedCount; i++) {
      const roomNumber = (parsedStartRoomNumber + i).toString();
      
      // Check if room number already exists
      const existingRoom = await Room.findOne({ roomNumber });
      if (existingRoom) {
        skippedRoomNumbers.push(roomNumber);
        continue; // Or handle error
      }

      const room = await Room.create({
        roomNumber,
        roomTypeId,
        floor: parsedFloor,
        status: RoomStatus.AVAILABLE,
      });
      createdRooms.push(room);
    }

    res.status(201).json({ 
      message: `${createdRooms.length} rooms created successfully`,
      rooms: createdRooms,
      skippedRoomNumbers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating multiple rooms", error });
  }
};

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalRooms = await Room.countDocuments();
    const rooms = await Room.find()
      .populate("roomTypeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      rooms,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRooms / limit),
        totalRooms,
        hasNext: page * limit < totalRooms,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error: error instanceof Error ? error.message : error });
  }
};

export const updateRoomStatus = async (
  req: AuthRequest,
  res: Response,
  ): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const room = await Room.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    await HousekeepingLog.create({
      roomId: room._id,
      staffId: req.user?.id,
      status: status,
      task: "Status Update",
      note: note || "Manual status update from room dashboard",
    });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error updating room status", error });
  }
};

export const getRoomCountByType = async (
  req: Request,
  res: Response,
  ): Promise<void> => {
  try {
    const counts = await Room.aggregate([
      { $group: { _id: "$roomTypeId", count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room counts", error });
  }
};
