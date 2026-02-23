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
exports.updateBookingStatus = exports.getMyBookings = exports.getBookings = exports.getInvoice = exports.confirmPayment = exports.createBooking = void 0;
const Booking_1 = __importStar(require("../models/Booking"));
const Reservation_1 = __importStar(require("../models/Reservation"));
const Room_1 = __importStar(require("../models/Room"));
const Payment_1 = __importStar(require("../models/Payment"));
const availability_1 = require("../utils/availability");
const mongoose_1 = __importDefault(require("mongoose"));
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { reservationId, checkInDate: checkInStr, checkOutDate: checkOutStr, adultsCount, childrenCount, bookedRooms, totalPrice, status, paymentMethod } = req.body;
        const guestId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!guestId) {
            res.status(401).json({ message: 'Unauthorized' });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        const checkInDate = new Date(checkInStr);
        const checkOutDate = new Date(checkOutStr);
        // --- Strict Total Price Validation (Including 15% Tax) ---
        const subtotalAmount = bookedRooms.reduce((sum, br) => sum + br.subtotal, 0);
        const taxAmount = Math.round(subtotalAmount * 0.15);
        const expectedTotal = subtotalAmount + taxAmount;
        if (Math.abs(expectedTotal - totalPrice) > 0.01) {
            res.status(400).json({ message: `Total price mismatch. Expected ${expectedTotal}, got ${totalPrice}.` });
            yield session.abortTransaction();
            session.endSession();
            return;
        }
        // --- Strict Availability Re-check ---
        if (bookedRooms && bookedRooms.length > 0) {
            for (const br of bookedRooms) {
                const roomId = br.roomId;
                // Re-check availability, excluding the current reservation if it exists
                const available = yield (0, availability_1.isRoomAvailable)(roomId, checkInDate, checkOutDate, reservationId);
                if (!available) {
                    res.status(400).json({ message: `Room ${roomId} is no longer available for these dates.` });
                    yield session.abortTransaction();
                    session.endSession();
                    return;
                }
            }
        }
        const bookingCode = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        // 1. Determine Initial Status based on Payment Method
        let bookingStatus = Booking_1.BookingStatus.CONFIRMED;
        let paymentStatus = Payment_1.PaymentStatus.COMPLETED;
        if (paymentMethod === 'Cash') {
            bookingStatus = Booking_1.BookingStatus.CONFIRMED_UNPAID;
            paymentStatus = Payment_1.PaymentStatus.PENDING;
        }
        // 2. Create Booking
        const bookingArray = yield Booking_1.default.create([{
                bookingCode,
                reservationId,
                guestId,
                checkInDate,
                checkOutDate,
                adultsCount,
                childrenCount,
                bookedRooms,
                subtotalAmount,
                taxAmount,
                totalPrice,
                status: bookingStatus
            }], { session });
        const booking = bookingArray[0];
        // 3. Create Payment
        const paymentArray = yield Payment_1.default.create([{
                bookingId: booking._id,
                guestId,
                amount: totalPrice,
                paymentMethod: paymentMethod || 'Card',
                status: paymentStatus,
                transactionId: paymentMethod === 'Card'
                    ? `TXN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
                    : undefined
            }], { session });
        const payment = paymentArray[0];
        // 4. Link Payment to Booking
        booking.paymentId = payment._id;
        yield booking.save({ session });
        if (reservationId) {
            yield Reservation_1.default.findByIdAndUpdate(reservationId, { status: Reservation_1.ReservationStatus.CONFIRMED }).session(session);
        }
        if (bookedRooms && bookedRooms.length > 0) {
            const roomIds = bookedRooms.map((br) => br.roomId);
            const newRoomStatus = (booking.status === Booking_1.BookingStatus.CHECKED_IN) ? Room_1.RoomStatus.OCCUPIED : Room_1.RoomStatus.RESERVED;
            yield Room_1.default.updateMany({ _id: { $in: roomIds } }, { status: newRoomStatus }).session(session);
        }
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json(booking);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        console.error('Create Booking Error:', error);
        res.status(500).json({ message: 'Error creating booking', error });
    }
});
exports.createBooking = createBooking;
const confirmPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.params; // Booking ID
        const booking = yield Booking_1.default.findById(id).populate('paymentId');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        if (booking.status !== Booking_1.BookingStatus.CONFIRMED_UNPAID) {
            res.status(400).json({ message: 'Booking is not in unpaid state' });
            return;
        }
        // Update Booking status
        booking.status = Booking_1.BookingStatus.CONFIRMED;
        yield booking.save({ session });
        // Update Payment status
        if (booking.paymentId) {
            yield Payment_1.default.findByIdAndUpdate(booking.paymentId, {
                status: Payment_1.PaymentStatus.COMPLETED,
                transactionId: `CASH-${Date.now()}`
            }).session(session);
        }
        yield session.commitTransaction();
        session.endSession();
        res.json({ message: 'Payment confirmed successfully', booking });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Error confirming payment', error });
    }
});
exports.confirmPayment = confirmPayment;
const getInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const booking = yield Booking_1.default.findById(id)
            .populate('guestId', 'fullName email')
            .populate('bookedRooms.roomId', 'roomNumber')
            .populate('paymentId');
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching invoice data', error });
    }
});
exports.getInvoice = getInvoice;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const bookings = yield Booking_1.default.find(query)
            .populate('guestId')
            .populate('bookedRooms.roomId')
            .sort({ createdAt: -1 });
        const standardizedBookings = bookings.map(b => {
            var _a, _b;
            const bookingObj = b.toObject();
            return Object.assign(Object.assign({}, bookingObj), { user: bookingObj.guestId, room: (_b = (_a = bookingObj.bookedRooms) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.roomId, guests: (bookingObj.adultsCount || 0) + (bookingObj.childrenCount || 0) });
        });
        res.json(standardizedBookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});
exports.getBookings = getBookings;
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const bookings = yield Booking_1.default.find({ guestId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id })
            .populate('bookedRooms.roomId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching your bookings', error });
    }
});
exports.getMyBookings = getMyBookings;
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = yield Booking_1.default.findById(id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        // Capture old status to handle room status changes
        const oldStatus = booking.status;
        booking.status = status;
        yield booking.save();
        // If checking out, set rooms to CLEANING and create housekeeping tasks
        if (status === Booking_1.BookingStatus.CHECKED_OUT && oldStatus !== Booking_1.BookingStatus.CHECKED_OUT) {
            const roomIds = booking.bookedRooms.map(br => br.roomId);
            // Update room status
            yield Room_1.default.updateMany({ _id: { $in: roomIds } }, { status: Room_1.RoomStatus.DIRTY });
            // Create Housekeeping Logs for these rooms
            // Note: We'll try to find a housekeeping staff to assign if possible, or leave it for now
            // For simplicity, we'll create tasks as PENDING/DIRTY
            const HousekeepingLog = (yield Promise.resolve().then(() => __importStar(require('../models/HousekeepingLog')))).default;
            const { HousekeepingStatus } = yield Promise.resolve().then(() => __importStar(require('../models/HousekeepingLog')));
            for (const roomId of roomIds) {
                yield HousekeepingLog.create({
                    roomId,
                    status: HousekeepingStatus.DIRTY,
                    task: 'Checkout Cleaning',
                    note: `Automatic task from Checkout of Booking ${booking.bookingCode}`
                });
            }
        }
        else if (status === Booking_1.BookingStatus.CHECKED_IN && oldStatus !== Booking_1.BookingStatus.CHECKED_IN) {
            const roomIds = booking.bookedRooms.map(br => br.roomId);
            yield Room_1.default.updateMany({ _id: { $in: roomIds } }, { status: Room_1.RoomStatus.OCCUPIED });
        }
        const updatedBooking = yield Booking_1.default.findById(id).populate('guestId').populate('bookedRooms.roomId');
        if (!updatedBooking) {
            res.status(404).json({ message: 'Booking not found after update' });
            return;
        }
        const bookingObj = updatedBooking.toObject();
        const standardizedResponse = Object.assign(Object.assign({}, bookingObj), { user: bookingObj.guestId, room: (_b = (_a = bookingObj.bookedRooms) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.roomId, guests: (bookingObj.adultsCount || 0) + (bookingObj.childrenCount || 0) });
        res.json(standardizedResponse);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error });
    }
});
exports.updateBookingStatus = updateBookingStatus;
