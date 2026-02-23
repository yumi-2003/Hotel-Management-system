"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getHousekeepingLogs = exports.updateHousekeepingStatus = exports.assignHousekeepingTask = exports.createHousekeepingLog = void 0;
const HousekeepingLog_1 = __importStar(require("../models/HousekeepingLog"));
const Room_1 = __importStar(require("../models/Room"));
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importStar(require("../models/Notification"));
const createHousekeepingLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('[DEBUG] createHousekeepingLog Payload:', req.body);
        const { roomId, room, status, note, staffId: providedStaffId, assignedTo } = req.body;
        const finalRoomId = roomId || room;
        const finalStaffId = providedStaffId || assignedTo || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const finalStatus = status || HousekeepingLog_1.HousekeepingStatus.DIRTY;
        console.log('[DEBUG] Mapped Fields:', { finalRoomId, finalStaffId, finalStatus, task: req.body.task });
        if (!finalRoomId) {
            res.status(400).json({ message: 'Room ID is required (DEBUG: finalRoomId was empty)' });
            return;
        }
        const log = yield HousekeepingLog_1.default.create({
            roomId: finalRoomId,
            staffId: finalStaffId,
            status: finalStatus,
            task: req.body.task || 'Routine Cleaning',
            note
        });
        yield Room_1.default.findByIdAndUpdate(finalRoomId, { status: finalStatus });
        const populatedLog = yield HousekeepingLog_1.default.findById(log._id)
            .populate('roomId', 'roomNumber floor status')
            .populate('staffId', 'fullName email');
        res.status(201).json(mapLogToFrontend(populatedLog));
    }
    catch (error) {
        console.error('[DEBUG] createHousekeepingLog Error:', error);
        res.status(500).json({
            message: 'Error creating housekeeping log (DEBUG: validation failed in latest code)',
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});
exports.createHousekeepingLog = createHousekeepingLog;
// Helper to map backend log to frontend expected structure
const mapLogToFrontend = (log) => {
    const logObj = log.toObject ? log.toObject() : log;
    return Object.assign(Object.assign({}, logObj), { room: logObj.roomId, assignedTo: logObj.staffId, roomId: undefined, staffId: undefined });
};
const assignHousekeepingTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { staffId } = req.body;
        const log = yield HousekeepingLog_1.default.findById(id);
        if (!log) {
            res.status(404).json({ message: 'Housekeeping log not found' });
            return;
        }
        log.staffId = staffId;
        yield log.save();
        // 1. Persist assignment in User model
        yield User_1.default.findByIdAndUpdate(staffId, {
            $addToSet: { tasksAssigned: log._id }
        });
        // 2. Create Notification for the staff member
        yield Notification_1.default.create({
            recipient: staffId,
            message: `You have been assigned a new task: ${log.task} for Room ${((_a = log.roomId) === null || _a === void 0 ? void 0 : _a.roomNumber) || '?'}.`,
            type: Notification_1.NotificationType.ASSIGNMENT,
            link: '/housekeeping/dashboard'
        });
        const populatedLog = yield HousekeepingLog_1.default.findById(log._id)
            .populate('roomId', 'roomNumber floor status')
            .populate('staffId', 'fullName email');
        res.json(mapLogToFrontend(populatedLog));
    }
    catch (error) {
        res.status(500).json({ message: 'Error assigning housekeeping task', error });
    }
});
exports.assignHousekeepingTask = assignHousekeepingTask;
const updateHousekeepingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, note, roomStatus: customRoomStatus } = req.body;
        const log = yield HousekeepingLog_1.default.findById(id);
        if (!log) {
            res.status(404).json({ message: 'Housekeeping log not found' });
            return;
        }
        log.status = status;
        if (note)
            log.note = note;
        // Ensure task is present to satisfy schema validation
        if (!log.task) {
            log.task = 'Routine Cleaning';
        }
        yield log.save();
        // Sync Room Status
        const roomStatusToSet = customRoomStatus || (status === HousekeepingLog_1.HousekeepingStatus.CLEAN ? Room_1.RoomStatus.AVAILABLE : Room_1.RoomStatus.CLEANING);
        yield Room_1.default.findByIdAndUpdate(log.roomId, { status: roomStatusToSet });
        const populatedLog = yield HousekeepingLog_1.default.findById(log._id)
            .populate('roomId', 'roomNumber floor status')
            .populate('staffId', 'fullName email');
        res.json(mapLogToFrontend(populatedLog));
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating housekeeping status', error });
    }
});
exports.updateHousekeepingStatus = updateHousekeepingStatus;
const getHousekeepingLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const query = {};
        if (status) {
            query.status = { $in: status.split(',') };
        }
        const logs = yield HousekeepingLog_1.default.find(query)
            .populate('roomId', 'roomNumber floor status')
            .populate('staffId', 'fullName email')
            .sort({ updatedAt: -1 });
        res.json(logs.map(mapLogToFrontend));
    }
    catch (error) {
        console.error('Error fetching housekeeping logs:', error);
        res.status(500).json({ message: 'Error fetching housekeeping logs', error });
    }
});
exports.getHousekeepingLogs = getHousekeepingLogs;
