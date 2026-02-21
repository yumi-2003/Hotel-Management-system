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
exports.updateRoomStatus = exports.getRooms = exports.createRoom = void 0;
const Room_1 = __importDefault(require("../models/Room"));
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield Room_1.default.create(req.body);
        res.status(201).json(room);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
});
exports.createRoom = createRoom;
const getRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield Room_1.default.find().populate('roomTypeId');
        res.json(rooms);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
});
exports.getRooms = getRooms;
const updateRoomStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const room = yield Room_1.default.findByIdAndUpdate(id, { status }, { new: true });
        res.json(room);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating room status', error });
    }
});
exports.updateRoomStatus = updateRoomStatus;
