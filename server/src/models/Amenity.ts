import mongoose, { Schema, Document } from 'mongoose';

export interface IAmenity extends Document {
  name: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AmenitySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IAmenity>('Amenity', AmenitySchema);
