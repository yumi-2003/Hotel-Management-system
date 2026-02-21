import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room, { RoomStatus } from '../models/Room';
import Reservation, { ReservationStatus } from '../models/Reservation';
import Booking, { BookingStatus } from '../models/Booking';
import { isRoomAvailable, getAvailableRooms } from '../utils/availability';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const runTests = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for testing.');

  try {
    // 1. Setup Test Data
    const roomType = new mongoose.Types.ObjectId();
    const testRoom = await Room.create({
      roomNumber: 'TEST-101',
      roomTypeId: roomType,
      floor: 1,
      status: RoomStatus.AVAILABLE
    });

    const checkIn = new Date('2026-03-01');
    const checkOut = new Date('2026-03-05');

    console.log('--- Test 1: Empty Room Availability ---');
    let available = await isRoomAvailable(testRoom._id as mongoose.Types.ObjectId, checkIn, checkOut);
    console.log(`Room available: ${available} (Expected: true)`);

    console.log('--- Test 2: Overlapping Reservation ---');
    const res = await Reservation.create({
      reservationCode: 'TEST-RES-1',
      guestId: new mongoose.Types.ObjectId(),
      checkInDate: new Date('2026-03-02'),
      checkOutDate: new Date('2026-03-06'),
      adultsCount: 1,
      childrenCount: 0,
      roomsCount: 1,
      expiresAt: new Date(Date.now() + 100000),
      reservedRooms: [{
        roomId: testRoom._id,
        pricePerNight: 100,
        nights: 4,
        subtotal: 400
      }],
      status: ReservationStatus.CONFIRMED
    });

    available = await isRoomAvailable(testRoom._id as mongoose.Types.ObjectId, checkIn, checkOut);
    console.log(`Room available: ${available} (Expected: false)`);

    console.log('--- Test 3: Non-overlapping Reservation ---');
    const futureCheckIn = new Date('2026-04-01');
    const futureCheckOut = new Date('2026-04-05');
    available = await isRoomAvailable(testRoom._id as mongoose.Types.ObjectId, futureCheckIn, futureCheckOut);
    console.log(`Room available: ${available} (Expected: true)`);

    console.log('--- Test 4: Excluding current reservation ---');
    available = await isRoomAvailable(testRoom._id as mongoose.Types.ObjectId, checkIn, checkOut, res._id as mongoose.Types.ObjectId);
    console.log(`Room available (excluding self): ${available} (Expected: true)`);

    console.log('--- Test 5: Overlapping Booking ---');
    await Booking.create({
      bookingCode: 'TEST-BK-1',
      guestId: new mongoose.Types.ObjectId(),
      checkInDate: new Date('2026-03-10'),
      checkOutDate: new Date('2026-03-15'),
      adultsCount: 1,
      childrenCount: 0,
      bookedRooms: [{
        roomId: testRoom._id,
        pricePerNight: 100,
        nights: 5,
        subtotal: 500
      }],
      totalPrice: 500,
      status: BookingStatus.CONFIRMED
    });

    const overlapCheckIn = new Date('2026-03-12');
    const overlapCheckOut = new Date('2026-03-16');
    available = await isRoomAvailable(testRoom._id as mongoose.Types.ObjectId, overlapCheckIn, overlapCheckOut);
    console.log(`Room available (with booking): ${available} (Expected: false)`);

    // Clean up
    await Room.deleteOne({ _id: testRoom._id });
    await Reservation.deleteOne({ _id: res._id });
    await Booking.deleteOne({ bookingCode: 'TEST-BK-1' });
    console.log('Cleanup completed.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
