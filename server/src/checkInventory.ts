import mongoose from 'mongoose';
import Room from './models/Room';
import RoomType from './models/RoomType';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function checkAllInventory() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roomTypes = await RoomType.find({});
    console.log(`Found ${roomTypes.length} Room Types:`);

    for (const rt of roomTypes) {
      const roomCount = await Room.countDocuments({ roomTypeId: rt._id });
      console.log(` - ${rt.typeName} (${rt._id}): ${roomCount} rooms`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Inventory check failed:', err);
  }
}

checkAllInventory();
