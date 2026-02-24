import mongoose, { Schema, Document } from 'mongoose';

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IPoolReservation extends Document {
  userId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId; // Optional: link to their hotel room
  slotId: mongoose.Types.ObjectId;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PoolReservationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  slotId: { type: Schema.Types.ObjectId, ref: 'PoolSlot', required: true },
  status: { 
    type: String, 
    enum: Object.values(ReservationStatus), 
    default: ReservationStatus.CONFIRMED 
  }
}, { timestamps: true });

export default mongoose.model<IPoolReservation>('PoolReservation', PoolReservationSchema);
