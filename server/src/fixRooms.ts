import mongoose from 'mongoose';
import Room from './models/Room';
import RoomType from './models/RoomType';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function fixRooms() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roomTypeName = 'Digital Nomad Suite';
    const roomType = await RoomType.findOne({ typeName: roomTypeName });

    if (!roomType) {
      console.log(`Room type "${roomTypeName}" not found`);
      return;
    }

    const roomNumbers = ['201', '202', '203'];
    const result = await Room.updateMany(
      { roomNumber: { $in: roomNumbers } },
      { $set: { roomTypeId: roomType._id, floor: 2, status: 'available' } }
    );

    console.log(`Updated ${result.modifiedCount} rooms`);
    
    // Check if rooms exist, if not create them
    for (const num of roomNumbers) {
      const existing = await Room.findOne({ roomNumber: num });
      if (!existing) {
        await Room.create({ roomNumber: num, roomTypeId: roomType._id, floor: 2, status: 'available' });
        console.log(`Created Room: ${num}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Fix failed:', err);
  }
}

fixRooms();
