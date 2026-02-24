import mongoose, { Schema, Document } from 'mongoose';

export interface IPoolSlot extends Document {
  startTime: string; // e.g., "10:00"
  endTime: string;   // e.g., "11:00"
  maxPeople: number;
  currentReserved: number;
  date: string;       // e.g., "2024-03-01"
  createdAt: Date;
  updatedAt: Date;
}

const PoolSlotSchema: Schema = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxPeople: { type: Number, required: true },
  currentReserved: { type: Number, default: 0 },
  date: { type: String, required: true }
}, { timestamps: true });

// Prevent overbooking at the schema level if possible, but we'll use findOneAndUpdate logic
PoolSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });

export default mongoose.model<IPoolSlot>('PoolSlot', PoolSlotSchema);
