import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoomType from '../models/RoomType';
import Room, { RoomStatus } from '../models/Room';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seedRooms = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    const roomTypes = await RoomType.find();
    console.log(`Found ${roomTypes.length} room types.`);

    let totalAdded = 0;

    for (const type of roomTypes) {
      console.log(`Processing Type: ${type.typeName}...`);
      
      // Get current rooms for this type to find the next number
      const rooms = await Room.find({ roomTypeId: type._id }).sort({ roomNumber: -1 });
      
      let nextRoomNumber: number;
      if (rooms.length > 0) {
        // Find highest number in the list
        const numbers = rooms.map(r => parseInt(r.roomNumber)).filter(n => !isNaN(n));
        nextRoomNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 101;
      } else {
        // Default start for types with no rooms
        // We can use a prefix based on index or just start at a high number to avoid collisions
        // Let's use 200 + index * 100 for zero-room types
        const typeIndex = roomTypes.indexOf(type);
        nextRoomNumber = (typeIndex + 1) * 100 + 1;
      }

      console.log(`  Adding 5 rooms starting from ${nextRoomNumber}...`);

      for (let i = 0; i < 5; i++) {
        const roomNumber = (nextRoomNumber + i).toString();
        
        // Check if room number already exists globally
        const existing = await Room.findOne({ roomNumber });
        if (existing) {
          console.log(`  Skip existing room: ${roomNumber}`);
          continue;
        }

        await Room.create({
          roomNumber,
          roomTypeId: type._id,
          floor: Math.floor(parseInt(roomNumber) / 100),
          status: RoomStatus.AVAILABLE
        });
        totalAdded++;
      }
    }

    console.log(`Seeding complete. Added ${totalAdded} rooms.`);

  } catch (error) {
    console.error('Failed to seed rooms:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedRooms();
