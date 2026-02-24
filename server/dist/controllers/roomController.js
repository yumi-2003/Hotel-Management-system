"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomCountByType = exports.updateRoomStatus = exports.getRooms = exports.createMultipleRooms = exports.createRoom = void 0;
const Room_1 = __importDefault(require("../models/Room"));
const HousekeepingLog_1 = __importDefault(require("../models/HousekeepingLog"));
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.create(req.body);
        res.status(201).json(room);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating room", error });
    }
});
exports.createRoom = createRoom;
const createMultipleRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const highestRoom = yield Room_1.default.findOne({}, {}, { sort: { roomNumber: -1 } });
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
            const room = yield Room_1.default.create(roomData);
            rooms.push(room);
            currentRoomNumber++;
        }
        res.status(201).json({
            message: `${count} rooms created successfully`,
            rooms,
        });
    }
    catch (error) {
        console.error("Error creating multiple rooms:", error);
        res.status(500).json({ message: "Error creating rooms", error });
    }
});
exports.createMultipleRooms = createMultipleRooms;
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalRooms = yield Room_1.default.countDocuments();
        const rooms = yield Room_1.default.find()
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
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching rooms", error });
    }
});
exports.getRooms = getRooms;
const updateRoomStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const staffId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const room = yield Room_1.default.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
        if (room) {
            // Create a record in housekeeping logs for the status change
            yield HousekeepingLog_1.default.create({
                roomId: id,
                staffId,
                status,
                note: note || `Status updated to ${status}`,
            });
        }
        res.json(room);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating room status", error });
    }
});
exports.updateRoomStatus = updateRoomStatus;
const getRoomCountByType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomCounts = yield Room_1.default.aggregate([
            {
                $group: {
                    _id: "$roomTypeId",
                    count: { $sum: 1 },
                },
            },
        ]);
        res.json(roomCounts);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching room counts", error });
    }
});
exports.getRoomCountByType = getRoomCountByType;
