import mongoose, { Schema, Document } from 'mongoose';
import { RoomStatus } from '../types/enums';

export interface IRoom extends Document {
  roomNumber: string;
  roomTypeId: mongoose.Types.ObjectId;
  floor: number;
  status: RoomStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
  floor: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(RoomStatus), 
    default: RoomStatus.AVAILABLE 
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<IRoom>('Room', RoomSchema);
