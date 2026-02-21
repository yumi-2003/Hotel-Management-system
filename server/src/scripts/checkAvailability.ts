
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room';
import RoomType from '../models/RoomType';
import Reservation, { ReservationStatus } from '../models/Reservation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function checkAvailability() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Get the RoomType ID (Let's check for 'Deluxe Room' as example, or list all)
    const roomTypes = await RoomType.find({});
    console.log(`Found ${roomTypes.length} room types.`);

    for (const rt of roomTypes) {
        console.log(`\nChecking availability for: ${rt.typeName} (ID: ${rt._id})`);
        
        // 2. Count total rooms
        const totalRooms = await Room.find({ roomTypeId: rt._id });
        console.log(`Total Rooms: ${totalRooms.length}`);
        totalRooms.forEach(r => console.log(` - Room ${r.roomNumber}: ${r.status}`));

        // 3. Check for overlapping reservations for a hypothetical date range
        // Let's assume a check-in of "tomorrow" and check-out of "day after tomorrow"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 2);
        dayAfter.setHours(11, 0, 0, 0);

        console.log(`Checking hypothetical dates: ${tomorrow.toISOString()} to ${dayAfter.toISOString()}`);

        const activeReservations = await Reservation.find({
            status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
            'reservedRooms.roomId': { $in: totalRooms.map(r => r._id) },
             $or: [
              { checkInDate: { $lt: dayAfter }, checkOutDate: { $gt: tomorrow } }
            ]
        }).populate('reservedRooms.roomId');

        console.log(`Active overlapping reservations: ${activeReservations.length}`);
        activeReservations.forEach(res => {
            console.log(` - Reservation ${res.reservationCode}: ${res.checkInDate.toISOString()} - ${res.checkOutDate.toISOString()} (Rooms: ${res.reservedRooms.map(r => (r.roomId as any).roomNumber).join(', ')})`);
        });

        const availableRooms = totalRooms.filter(r => {
             const isBooked = activeReservations.some(res => 
                 res.reservedRooms.some(rr => rr.roomId.toString() === r._id.toString())
             );
             return !isBooked; //  && r.status !== 'maintenance' (logic check)
        });
         console.log(`Calculated Available Rooms: ${availableRooms.length}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAvailability();
