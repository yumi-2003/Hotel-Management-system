import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room';
import RoomType from '../models/RoomType';
import Booking, { IBooking } from '../models/Booking';
import User from '../models/User';
import Payment from '../models/Payment';
import { BookingStatus, RoomStatus, PaymentStatus, UserRole, UserStatus } from '../types/enums';
// import { v4 as uuidv4 } from 'uuid'; // Removed to avoid missing dependency

const generateId = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const GUESTS_TO_CREATE = [
  { fullName: 'John Doe', email: 'john.doe@example.com' },
  { fullName: 'Jane Smith', email: 'jane.smith@example.com' },
  { fullName: 'Michael Brown', email: 'michael.b@example.com' },
  { fullName: 'Sarah Wilson', email: 'sarah.w@example.com' },
  { fullName: 'David Lee', email: 'david.lee@example.com' }
];

async function seedAnalyticsData() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Ensure models are registered (especially for populate)
    Booking; 
    Room;
    RoomType;
    User;
    Payment;

    // 1. Ensure Guests Exist
    const guestIds: mongoose.Types.ObjectId[] = [];
    for (const g of GUESTS_TO_CREATE) {
      let user = await User.findOne({ email: g.email });
      if (!user) {
        user = await User.create({
          ...g,
          passwordHash: 'seeded_password_hash', // Not usable for login but fine for data
          role: UserRole.GUEST,
          status: UserStatus.ACTIVE
        });
        console.log(`Created guest: ${g.fullName}`);
      }
      guestIds.push(user._id as mongoose.Types.ObjectId);
    }

    // 2. Fetch Rooms and Types
    const rooms = await Room.find().populate('roomTypeId');
    const roomCount = rooms.length;
    console.log(`Found ${roomCount} rooms.`);

    if (roomCount === 0) {
      console.error('No rooms found. Please run seed.ts first.');
      return;
    }

    // 3. Generate Bookings over last 6 months + next month
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 6);
    
    let totalBookingsAdded = 0;
    let totalPaymentsAdded = 0;

    for (const room of rooms) {
      console.log(`Generating bookings for Room ${room.roomNumber}...`);
      
      let currentDate = new Date(startDate);
      // Randomize start offset for each room so they don't all start at the same time
      currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 10));

      while (currentDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        const stayDuration = Math.floor(Math.random() * 4) + 2; // 2-5 nights
        const checkIn = new Date(currentDate);
        const checkOut = new Date(currentDate);
        checkOut.setDate(checkOut.getDate() + stayDuration);

        // Gap before next booking
        const gap = Math.floor(Math.random() * 7) + 1; // 1-7 days gap
        currentDate = new Date(checkOut);
        currentDate.setDate(currentDate.getDate() + gap);

        // Determine status based on dates
        let status: BookingStatus = BookingStatus.CHECKED_OUT;
        if (checkIn <= now && checkOut >= now) {
          status = BookingStatus.CHECKED_IN;
        } else if (checkIn > now) {
          status = BookingStatus.CONFIRMED;
        }

        const roomType = room.roomTypeId as any;
        const pricePerNight = roomType.basePrice || 100;
        const subtotal = pricePerNight * stayDuration;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        const guestId = guestIds[Math.floor(Math.random() * guestIds.length)];

        // Create Booking
        const bookingCode = `ANA-${generateId(8)}`;
        
        // We use create and then manually update createdAt if it's in the past
        // But better is to just pass it in the creation if timestamps allow
        const booking = await Booking.create({
          bookingCode,
          guestId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adultsCount: Math.floor(Math.random() * roomType.maxAdults) + 1,
          childrenCount: Math.floor(Math.random() * roomType.maxChildren),
          status,
          bookedRooms: [{
            roomId: room._id,
            pricePerNight,
            nights: stayDuration,
            subtotal
          }],
          subtotalAmount: subtotal,
          taxAmount: tax,
          totalPrice: total,
          createdAt: checkIn // Set creation date to check-in for historical data
        });

        // Create Payment
        let paymentStatus = PaymentStatus.COMPLETED;
        if (status === BookingStatus.CONFIRMED && Math.random() > 0.5) {
          paymentStatus = PaymentStatus.PENDING;
        }

        await Payment.create({
          bookingId: booking._id,
          guestId,
          amount: total,
          currency: 'USD',
          paymentMethod: ['Credit Card', 'Cash', 'PayPal', 'Transfer'][Math.floor(Math.random() * 4)],
          status: paymentStatus,
          transactionId: `TXN-${generateId(12)}`,
          createdAt: checkIn // Important for revenue charts
        });

        totalBookingsAdded++;
        totalPaymentsAdded++;
      }
    }

    console.log(`Seeding complete!`);
    console.log(`Added ${totalBookingsAdded} bookings.`);
    console.log(`Added ${totalPaymentsAdded} payments.`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedAnalyticsData();
