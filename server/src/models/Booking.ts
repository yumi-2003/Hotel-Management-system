import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  CONFIRMED_UNPAID = 'confirmed_unpaid',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export interface IBookedRoom {
  roomId: mongoose.Types.ObjectId;
  pricePerNight: number;
  nights: number;
  subtotal: number;
}

export interface IBooking extends Document {
  bookingCode: string;
  reservationId?: mongoose.Types.ObjectId;
  guestId: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  adultsCount: number;
  childrenCount: number;
  status: BookingStatus;
  bookedRooms: IBookedRoom[];
  subtotalAmount: number;
  taxAmount: number;
  totalPrice: number;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookedRoomSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  pricePerNight: { type: Number, required: true },
  nights: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const BookingSchema: Schema = new Schema({
  bookingCode: { type: String, required: true, unique: true },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
