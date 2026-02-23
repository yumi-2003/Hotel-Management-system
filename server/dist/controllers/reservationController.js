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
exports.updateReservationStatus = exports.getReservations = exports.getMyReservations = exports.createReservation = void 0;
const Reservation_1 = __importStar(require("../models/Reservation"));
const RoomType_1 = __importDefault(require("../models/RoomType"));
const availability_1 = require("../utils/availability");
const mongoose_1 = __importDefault(require("mongoose"));
const createReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { roomType: roomTypeId, checkInDate: checkInStr, checkOutDate: checkOutStr, adultsCount, childrenCount } = req.body;
        const guestId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!guestId) {
            res.status(401).json({ message: 'Unauthorized' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        if (!roomTypeId || !checkInStr || !checkOutStr || adultsCount === undefined) {
            res.status(400).json({ message: 'Missing required fields: roomType, checkInDate, checkOutDate, and adultsCount are required' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        const checkInDate = new Date(checkInStr);
        const checkOutDate = new Date(checkOutStr);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            res.status(400).json({ message: 'Invalid date format' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        if (checkInDate >= checkOutDate) {
            res.status(400).json({ message: 'Check-out date must be after check-in date' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        // Get RoomType details
        const roomType = yield RoomType_1.default.findById(roomTypeId).session(session);
        if (!roomType) {
            res.status(404).json({ message: 'Room type not found' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        // --- Strict Availability Logic with Atomic Validation ---
        const availableRooms = yield (0, availability_1.getAvailableRooms)(roomTypeId, checkInDate, checkOutDate);
        if (availableRooms.length === 0) {
            res.status(400).json({ message: `No ${roomType.typeName} rooms are available for these dates.` });
            yield session.abortTransaction();
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
        const reservation = yield Reservation_1.default.create([{
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
                status: Reservation_1.ReservationStatus.PENDING
            }], { session });
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json(reservation[0]);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error('Create Reservation Error:', error);
        res.status(500).json({ message: 'Error creating reservation', error });
    }
});
exports.createReservation = createReservation;
const mapReservationToFrontend = (r) => {
    var _a, _b, _c;
    const reservationObj = r.toObject ? r.toObject() : r;
    // Auto-expiry check
    if (reservationObj.status === Reservation_1.ReservationStatus.PENDING && new Date() > new Date(reservationObj.expiresAt)) {
        reservationObj.status = Reservation_1.ReservationStatus.EXPIRED;
        // Note: We don't save here to keep it side-effect free in mapping, 
        // but ideally a cleaner/worker handles this.
    }
    return Object.assign(Object.assign({}, reservationObj), { user: reservationObj.guestId, 
        // Extracting roomType info from the first reserved room
        roomType: ((_c = (_b = (_a = reservationObj.reservedRooms) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.roomId) === null || _c === void 0 ? void 0 : _c.roomTypeId) || null, guests: reservationObj.adultsCount + reservationObj.childrenCount });
};
const getMyReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const reservations = yield Reservation_1.default.find({ guestId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id })
            .populate({
            path: 'reservedRooms.roomId',
            populate: { path: 'roomTypeId' }
        })
            .sort({ createdAt: -1 });
        const mappedReservations = reservations.map(mapReservationToFrontend);
        res.json(mappedReservations);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error });
    }
});
exports.getMyReservations = getMyReservations;
const getReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const reservations = yield Reservation_1.default.find(query)
            .populate('guestId', 'fullName email')
            .populate({
            path: 'reservedRooms.roomId',
            populate: { path: 'roomTypeId' }
        })
            .sort({ createdAt: -1 });
        const mappedReservations = reservations.map(mapReservationToFrontend);
        res.json(mappedReservations);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error });
    }
});
exports.getReservations = getReservations;
const updateReservationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reservation = yield Reservation_1.default.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).populate('guestId', 'fullName email')
            .populate({
            path: 'reservedRooms.roomId',
            populate: { path: 'roomTypeId' }
        });
        if (!reservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }
        res.json(mapReservationToFrontend(reservation));
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating reservation status', error });
    }
});
exports.updateReservationStatus = updateReservationStatus;
