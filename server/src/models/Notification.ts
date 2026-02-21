import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  ASSIGNMENT = 'assignment',
  STATUS_UPDATE = 'status_update',
  SYSTEM = 'system'
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: Object.values(NotificationType), 
    default: NotificationType.SYSTEM 
  },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
