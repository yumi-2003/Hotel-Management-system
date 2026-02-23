import { Request, Response } from "express";
import Room from "../models/Room";
import HousekeepingLog from "../models/HousekeepingLog";
import { AuthRequest } from "../middleware/auth";

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

    if (!roomTypeId || !count || count <= 0) {
      res
        .status(400)
        .json({ message: "Room type ID and valid count are required" });
      return;
    }

    const rooms = [];
    let currentRoomNumber = startRoomNumber || 100; // Default starting room number

    // Find the highest room number to avoid conflicts
    const highestRoom = await Room.findOne(
      {},
      {},
      { sort: { roomNumber: -1 } },
    );
    if (highestRoom) {
      const highestNum = parseInt(highestRoom.roomNumber);
      if (!isNaN(highestNum)) {
        currentRoomNumber = Math.max(currentRoomNumber, highestNum + 1);
      }
    }

    for (let i = 0; i < count; i++) {
      const roomData = {
        roomNumber: currentRoomNumber.toString(),
        roomTypeId,
        floor: floor || 1,
        status: "available",
      };

      const room = await Room.create(roomData);
      rooms.push(room);
      currentRoomNumber++;
    }

    res.status(201).json({
      message: `${count} rooms created successfully`,
      rooms,
    });
  } catch (error) {
    console.error("Error creating multiple rooms:", error);
    res.status(500).json({ message: "Error creating rooms", error });
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
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};

export const updateRoomStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const staffId = req.user?.id;

    const room = await Room.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (room) {
      // Create a record in housekeeping logs for the status change
      await HousekeepingLog.create({
        roomId: id,
        staffId,
        status,
        note: note || `Status updated to ${status}`,
      });
    }

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
    const roomCounts = await Room.aggregate([
      {
        $group: {
          _id: "$roomTypeId",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(roomCounts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room counts", error });
  }
};
