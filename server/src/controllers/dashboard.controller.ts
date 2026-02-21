import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking';
import Room, { RoomStatus } from '../models/Room';
import RoomType from '../models/RoomType';
import Payment, { PaymentStatus } from '../models/Payment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. KPI Metrics
    // Calculate total revenue from COMPLETED payments
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const totalBookings = await Booking.countDocuments();

    const checkInsToday = await Booking.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED_UNPAID] }
    });

    const checkOutsToday = await Booking.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.CHECKED_IN] }
    });

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: RoomStatus.OCCUPIED });
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // 2. Operational Data
    
    // Detailed Arrivals Today
    const todaysArrivals = await Booking.find({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED_UNPAID] }
    }).populate('guestId', 'fullName email').populate('bookedRooms.roomId', 'roomNumber');

    // Detailed Departures Today
    const todaysDepartures = await Booking.find({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CHECKED_IN
    }).populate('guestId', 'fullName email').populate('bookedRooms.roomId', 'roomNumber');

    // Rooms Needing Cleaning
    const roomsNeedingCleaning = await Room.find({ status: RoomStatus.CLEANING })
      .populate('roomTypeId', 'typeName');

    // 3. Financial Trends (From Payments)
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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent Payments List
    const recentPayments = await Payment.find()
      .populate('guestId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // 4. Other Analytics
    const roomStatusDistribution = await Room.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const roomTypePerformance = await Booking.aggregate([
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

    res.status(200).json({
      kpi: {
        totalRevenue,
        totalBookings,
        checkInsToday,
        checkOutsToday,
        occupancyRate,
        totalRooms,
        occupiedRooms
      },
      operational: {
        todaysArrivals,
        todaysDepartures,
        roomsNeedingCleaning,
        recentPayments
      },
      charts: {
        weeklyRevenue,
        roomStatusDistribution,
        roomTypePerformance,
        monthlyRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};
