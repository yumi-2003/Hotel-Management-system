import mongoose, { Schema, Document } from 'mongoose';

export enum PoolStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
}

export interface IPool extends Document {
  name: string;
  status: PoolStatus;
  currentOccupancy: number;
  maxCapacity: number;
  temperature: number; // in Celsius
  openingTime: string; // e.g., "08:00"
  closingTime: string; // e.g., "20:00"
  notes?: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PoolSchema: Schema = new Schema({
  name: { type: String, required: true, default: 'Main Infinity Pool' },
  status: { 
    type: String, 
    enum: Object.values(PoolStatus), 
    default: PoolStatus.OPEN 
  },
  currentOccupancy: { type: Number, default: 0 },
  maxCapacity: { type: Number, default: 50 },
  temperature: { type: Number, default: 28 },
  openingTime: { type: String, default: '08:00' },
  closingTime: { type: String, default: '22:00' },
  notes: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IPool>('Pool', PoolSchema);
