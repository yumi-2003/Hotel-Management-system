import mongoose, { Schema, Document } from 'mongoose';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface IReservedRoom {
  roomId: mongoose.Types.ObjectId;
  pricePerNight: number;
  nights: number;
  subtotal: number;
}

export interface IReservation extends Document {
  reservationCode: string;
  guestId: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: ReservationStatus;
  expiresAt: Date;
  reservedRooms: IReservedRoom[];
  createdAt: Date;
  updatedAt: Date;
}

const ReservedRoomSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  pricePerNight: { type: Number, required: true },
  nights: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const ReservationSchema: Schema = new Schema({
  reservationCode: { type: String, required: true, unique: true },
  guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  adultsCount: { type: Number, required: true },
  childrenCount: { type: Number, required: true },
  roomsCount: { type: Number, required: true },
  subtotalAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(ReservationStatus), 
    default: ReservationStatus.PENDING 
  },
  expiresAt: { type: Date, required: true },
  reservedRooms: [ReservedRoomSchema]
}, { timestamps: true });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
