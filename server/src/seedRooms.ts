import mongoose from 'mongoose';
import Room from './models/Room';
import RoomType from './models/RoomType';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function seedRooms() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roomTypeName = 'Digital Nomad Suite';
    const roomType = await RoomType.findOne({ typeName: roomTypeName });

    if (!roomType) {
      console.log(`Room type "${roomTypeName}" not found`);
      return;
    }

    const roomsData = [
      { roomNumber: '201', roomTypeId: roomType._id, status: 'available', floor: 2 },
      { roomNumber: '202', roomTypeId: roomType._id, status: 'available', floor: 2 },
      { roomNumber: '203', roomTypeId: roomType._id, status: 'available', floor: 2 },
    ];

    for (const data of roomsData) {
      const existing = await Room.findOne({ roomNumber: data.roomNumber });
      if (!existing) {
        await Room.create(data);
        console.log(`Created Room: ${data.roomNumber}`);
      } else {
        console.log(`Room ${data.roomNumber} already exists`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

seedRooms();
