import mongoose from 'mongoose';
import Booking, { BookingStatus } from './models/Booking';
import Room, { RoomStatus } from './models/Room';
import RoomType from './models/RoomType';
import Payment, { PaymentStatus } from './models/Payment';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function reproduce() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    console.log('1. Fetching KPI Metrics...');
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    console.log('Total Revenue:', totalRevenue);

    const totalBookings = await Booking.countDocuments();
    console.log('Total Bookings:', totalBookings);

    console.log('2. Fetching Operational Data...');
    const todaysArrivals = await Booking.find({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED_UNPAID] }
    }).populate('guestId', 'fullName email').populate('bookedRooms.roomId', 'roomNumber');
    console.log('Todays Arrivals:', todaysArrivals.length);

    console.log('3. Fetching Financial Trends...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyRevenue = await Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('Weekly Revenue:', weeklyRevenue);

    console.log('4. Debugging Room Type Performance (Complex Aggregation)...');
    
    console.log(' - Stage 1: Match and Unwind');
    const stage1 = await Booking.aggregate([
        { $match: { status: { $ne: BookingStatus.CANCELLED } } },
        { $unwind: "$bookedRooms" },
        { $limit: 1 }
    ]);
    console.log('Stage 1 Result:', JSON.stringify(stage1, null, 2));

    console.log(' - Stage 2: Lookups');
    const stage2 = await Booking.aggregate([
        { $match: { status: { $ne: BookingStatus.CANCELLED } } },
        { $unwind: "$bookedRooms" },
        {
            $lookup: {
                from: "rooms",
                localField: "bookedRooms.roomId",
                foreignField: "_id",
                as: "room"
            }
        },
        { $unwind: "$room" },
        {
            $lookup: {
                from: "roomtypes",
                localField: "room.roomTypeId",
                foreignField: "_id",
                as: "roomType"
            }
        },
        { $unwind: "$roomType" },
        { $limit: 1 }
    ]);
    console.log('Stage 2 Result:', JSON.stringify(stage2, null, 2));

    console.log(' - Stage 3: Group');
    const stage3 = await Booking.aggregate([
        { $match: { status: { $ne: BookingStatus.CANCELLED } } },
        { $unwind: "$bookedRooms" },
        {
            $lookup: {
                from: "rooms",
                localField: "bookedRooms.roomId",
                foreignField: "_id",
                as: "room"
            }
        },
        { $unwind: "$room" },
        {
            $lookup: {
                from: "roomtypes",
                localField: "room.roomTypeId",
                foreignField: "_id",
                as: "roomType"
            }
        },
        { $unwind: "$roomType" },
        {
            $group: {
                _id: "$roomType.typeName",
                revenue: { $sum: "$bookedRooms.subtotal" },
                bookings: { $sum: 1 }
            }
        }
    ]);
    console.log('Stage 3 Result:', stage3);

    console.log('Success!');
    await mongoose.disconnect();
  } catch (error: any) {
    console.error('FAILED during reproduction!');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    process.exit(1);
  }
}

reproduce();
