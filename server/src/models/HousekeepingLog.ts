import mongoose, { Schema, Document } from 'mongoose';

export enum HousekeepingStatus {
  DIRTY = 'dirty',
  CLEANING = 'cleaning',
  CLEAN = 'clean',
  OUT_OF_SERVICE = 'out_of_service'
}

export interface IHousekeepingLog extends Document {
  roomId: mongoose.Types.ObjectId;
  staffId?: mongoose.Types.ObjectId;
  status: HousekeepingStatus;
  task: string;
  note?: string;
  updatedAt: Date;
}

const HousekeepingLogSchema: Schema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: Object.values(HousekeepingStatus), 
    required: true 
  },
  task: { type: String, required: true },
  note: { type: String }
}, { timestamps: { createdAt: true, updatedAt: true } });

export default mongoose.model<IHousekeepingLog>('HousekeepingLog', HousekeepingLogSchema);
