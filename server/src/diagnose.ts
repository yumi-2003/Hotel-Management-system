import mongoose from 'mongoose';
import Room from './models/Room';
import RoomType from './models/RoomType';
import Reservation from './models/Reservation';
import Booking from './models/Booking';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function diagnose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const roomTypeName = 'Digital Nomad Suite';
    const roomType = await RoomType.findOne({ typeName: roomTypeName });

    if (!roomType) {
      console.log(`Room type "${roomTypeName}" not found`);
      return;
    }

    console.log(`Found RoomType: ${roomType._id} (${roomType.typeName})`);

    const rooms = await Room.find({ roomTypeId: roomType._id });
    console.log(`Total rooms of this type: ${rooms.length}`);
    rooms.forEach(r => console.log(` - Room: ${r.roomNumber}, Status: ${r.status}`));

    const checkIn = new Date('2026-03-01');
    const checkOut = new Date('2026-03-03');

    const reservations = await Reservation.find({
      'reservedRooms.roomId': { $in: rooms.map(r => r._id) },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      status: { $in: ['pending', 'confirmed'] }
    });

    console.log(`Total overlapping reservations: ${reservations.length}`);
    reservations.forEach(res => {
      console.log(` - Reservation: ${res.reservationCode}, From: ${res.checkInDate}, To: ${res.checkOutDate}, Status: ${res.status}`);
    });

    const bookings = await Booking.find({
      'bookedRooms.roomId': { $in: rooms.map(r => r._id) },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
      status: { $in: ['pending_payment', 'confirmed', 'checked_in'] }
    });

    console.log(`Total overlapping bookings: ${bookings.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Diagnosis failed:', err);
  }
}

diagnose();
