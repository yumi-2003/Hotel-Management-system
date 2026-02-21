import mongoose from 'mongoose';
import Room from './models/Room';
import RoomType from './models/RoomType';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function seedAllMissingRooms() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roomTypes = await RoomType.find({});
    console.log(`Checking ${roomTypes.length} Room Types...`);

    let totalCreated = 0;

    for (const rt of roomTypes) {
      const roomCount = await Room.countDocuments({ roomTypeId: rt._id });
      if (roomCount === 0) {
        console.log(`Seeding rooms for ${rt.typeName}...`);
        
        // Seed 3 rooms for each empty type
        const roomsToCreate = [
          { roomNumber: `${rt.typeName.substring(0, 2).toUpperCase()}-101`, roomTypeId: rt._id, floor: 1, status: 'available' },
          { roomNumber: `${rt.typeName.substring(0, 2).toUpperCase()}-102`, roomTypeId: rt._id, floor: 1, status: 'available' },
          { roomNumber: `${rt.typeName.substring(0, 2).toUpperCase()}-103`, roomTypeId: rt._id, floor: 1, status: 'available' },
        ];

        for (const roomData of roomsToCreate) {
          // Check if roomNumber exists globally
          const existing = await Room.findOne({ roomNumber: roomData.roomNumber });
          if (!existing) {
            await Room.create(roomData);
            totalCreated++;
          } else {
            // If exists, try a different number
             await Room.create({ ...roomData, roomNumber: roomData.roomNumber + '-B' });
             totalCreated++;
          }
        }
      }
    }

    console.log(`Successfully created ${totalCreated} rooms.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

seedAllMissingRooms();
