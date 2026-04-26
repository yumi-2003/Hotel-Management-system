import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoomType from './src/models/RoomType';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-mgmt";

const checkDB = async () => {
  await mongoose.connect(MONGODB_URI);
  const roomTypes = await RoomType.find({});
  for (const rt of roomTypes) {
    const uniqueImages = new Set(rt.images);
    if (uniqueImages.size !== rt.images.length) {
      console.log(`DUPLICATES in ${rt.typeName}: \n`, rt.images);
    }
  }
  console.log("Check complete.");
  await mongoose.disconnect();
};
checkDB();
