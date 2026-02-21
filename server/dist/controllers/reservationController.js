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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReservations = exports.createReservation = void 0;
const Reservation_1 = __importStar(require("../models/Reservation"));
const createReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { checkInDate, checkOutDate, adultsCount, childrenCount, roomsCount, reservedRooms } = req.body;
        const guestId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!guestId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Check availability for each room
        for (const item of reservedRooms) {
            const overlapping = yield Reservation_1.default.findOne({
                status: { $in: [Reservation_1.ReservationStatus.PENDING, Reservation_1.ReservationStatus.CONFIRMED] },
                'reservedRooms.roomId': item.roomId,
                $or: [
                    { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } }
                ]
            });
            if (overlapping) {
                res.status(400).json({ message: `Room ${item.roomId} is not available for these dates` });
                return;
            }
        }
        const reservationCode = `RES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        const reservation = yield Reservation_1.default.create({
            reservationCode,
            guestId,
            checkInDate,
            checkOutDate,
            adultsCount,
            childrenCount,
            roomsCount,
            expiresAt,
            reservedRooms,
            status: Reservation_1.ReservationStatus.PENDING
        });
        res.status(201).json(reservation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating reservation', error });
    }
});
exports.createReservation = createReservation;
const getMyReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const reservations = yield Reservation_1.default.find({ guestId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }).populate('reservedRooms.roomId');
        res.json(reservations);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error });
    }
});
exports.getMyReservations = getMyReservations;
