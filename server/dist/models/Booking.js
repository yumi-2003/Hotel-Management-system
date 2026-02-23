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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING_PAYMENT"] = "pending_payment";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["CONFIRMED_UNPAID"] = "confirmed_unpaid";
    BookingStatus["CHECKED_IN"] = "checked_in";
    BookingStatus["CHECKED_OUT"] = "checked_out";
    BookingStatus["CANCELLED"] = "cancelled";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
const BookedRoomSchema = new mongoose_1.Schema({
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Room', required: true },
    pricePerNight: { type: Number, required: true },
    nights: { type: Number, required: true },
    subtotal: { type: Number, required: true }
}, { _id: false });
const BookingSchema = new mongoose_1.Schema({
    bookingCode: { type: String, required: true, unique: true },
    reservationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Reservation' },
    guestId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    adultsCount: { type: Number, required: true },
    childrenCount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.PENDING_PAYMENT
    },
    bookedRooms: [BookedRoomSchema],
    subtotalAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Booking', BookingSchema);
