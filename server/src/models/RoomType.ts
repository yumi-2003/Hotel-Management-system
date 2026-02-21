import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomType extends Document {
  typeName: string;
  description: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
  bedType: string;
  sizeSqm?: number;
  images?: string[];
  amenities: mongoose.Types.ObjectId[];
  rating: number;
  numReviews: number;
  discount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema: Schema = new Schema({
  typeName: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  maxAdults: { type: Number, required: true },
  maxChildren: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  bedType: { type: String, required: true },
  sizeSqm: { type: Number },
  images: [{ type: String }],
  amenities: [{ type: Schema.Types.ObjectId, ref: 'Amenity' }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IRoomType>('RoomType', RoomTypeSchema);
