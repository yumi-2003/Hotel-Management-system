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
exports.getHousekeepingLogs = exports.createHousekeepingLog = void 0;
const HousekeepingLog_1 = __importDefault(require("../models/HousekeepingLog"));
const Room_1 = __importDefault(require("../models/Room"));
const createHousekeepingLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { roomId, status, note } = req.body;
        const staffId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const log = yield HousekeepingLog_1.default.create({
            roomId,
            staffId,
            status,
            note
        });
        yield Room_1.default.findByIdAndUpdate(roomId, { status });
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating housekeeping log', error });
    }
});
exports.createHousekeepingLog = createHousekeepingLog;
const getHousekeepingLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = yield HousekeepingLog_1.default.find().populate('roomId').populate('staffId');
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching housekeeping logs', error });
    }
});
exports.getHousekeepingLogs = getHousekeepingLogs;
