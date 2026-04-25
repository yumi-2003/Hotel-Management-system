import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '../types/enums';

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  tasksAssigned: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  profileImage: { type: String },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.GUEST 
  },
  status: { 
    type: String, 
    enum: Object.values(UserStatus), 
    default: UserStatus.ACTIVE 
  },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  tasksAssigned: [{ type: Schema.Types.ObjectId, ref: 'HousekeepingLog' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
