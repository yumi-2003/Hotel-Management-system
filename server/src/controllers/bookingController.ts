import { Request, Response } from "express";
import Booking, { BookingStatus } from "../models/Booking";
import Reservation, { ReservationStatus } from "../models/Reservation";
import Room, { RoomStatus } from "../models/Room";
import Payment, { PaymentStatus } from "../models/Payment";
import Notification, { NotificationType } from '../models/Notification';
import { AuthRequest } from "../middleware/auth";
import { isRoomAvailable } from "../utils/availability";
import mongoose from "mongoose";

export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      reservationId,
      checkInDate: checkInStr,
      checkOutDate: checkOutStr,
      adultsCount,
      childrenCount,
      bookedRooms,
      totalPrice,
      status,
      paymentMethod,
    } = req.body;
    const guestId = req.user?.id;

    if (!guestId) {
      res.status(401).json({ message: "Unauthorized" });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    // --- Strict Total Price Validation (Including 15% Tax) ---
    const subtotalAmount = bookedRooms.reduce(
      (sum: number, br: any) => sum + br.subtotal,
      0,
    );
    const taxAmount = Math.round(subtotalAmount * 0.15);
    const expectedTotal = subtotalAmount + taxAmount;

    if (Math.abs(expectedTotal - totalPrice) > 0.01) {
      res
        .status(400)
        .json({
          message: `Total price mismatch. Expected ${expectedTotal}, got ${totalPrice}.`,
        });
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // --- Strict Availability Re-check ---
    if (bookedRooms && bookedRooms.length > 0) {
      for (const br of bookedRooms) {
        const roomId = br.roomId;

        // Re-check availability, excluding the current reservation if it exists
        const available = await isRoomAvailable(
          roomId,
          checkInDate,
          checkOutDate,
          reservationId,
        );

        if (!available) {
          res
            .status(400)
            .json({
              message: `Room ${roomId} is no longer available for these dates.`,
            });
          await session.abortTransaction();
          session.endSession();
          return;
        }
      }
    }

    const bookingCode = `BK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Determine Initial Status based on Payment Method
    let bookingStatus = BookingStatus.CONFIRMED;
    let paymentStatus = PaymentStatus.COMPLETED;

    if (paymentMethod === "Cash") {
      bookingStatus = BookingStatus.CONFIRMED_UNPAID;
      paymentStatus = PaymentStatus.PENDING;
    }

    // 2. Create Booking
    const bookingArray = await Booking.create(
      [
        {
          bookingCode,
          reservationId,
          guestId,
          checkInDate,
          checkOutDate,
          adultsCount,
          childrenCount,
          bookedRooms,
          subtotalAmount,
          taxAmount,
          totalPrice,
          status: bookingStatus,
        },
      ],
      { session },
    );

    const booking = bookingArray[0];

    // 3. Create Payment
    const paymentArray = await Payment.create(
      [
        {
          bookingId: booking._id,
          guestId,
          amount: totalPrice,
          paymentMethod: paymentMethod || "Card",
          status: paymentStatus,
          transactionId:
            paymentMethod === "Card"
              ? `TXN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
              : undefined,
        },
      ],
      { session },
    );

    const payment = paymentArray[0];

    // 4. Link Payment to Booking
    booking.paymentId = payment._id;
    await booking.save({ session });

    if (reservationId) {
      await Reservation.findByIdAndUpdate(reservationId, {
        status: ReservationStatus.CONFIRMED,
      }).session(session);
    }

    if (bookedRooms && bookedRooms.length > 0) {
      const roomIds = bookedRooms.map((br: any) => br.roomId);
      const newRoomStatus =
        booking.status === BookingStatus.CHECKED_IN
          ? RoomStatus.OCCUPIED
          : RoomStatus.RESERVED;

      await Room.updateMany(
        { _id: { $in: roomIds } },
        { status: newRoomStatus },
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    // Create Notification for the guest
    await Notification.create({
      recipient: guestId,
      message: `Your booking ${booking.bookingCode} is confirmed. Thank you for choosing us!`,
      type: NotificationType.SYSTEM,
      link: '/my-reservations'
    });

    res.status(201).json(booking);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Error creating booking", error });
  }
};

export const confirmPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params; // Booking ID
    const booking = await Booking.findById(id).populate("paymentId");
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.status !== BookingStatus.CONFIRMED_UNPAID) {
      res.status(400).json({ message: "Booking is not in unpaid state" });
      return;
    }

    // Update Booking status
    booking.status = BookingStatus.CONFIRMED;
    await booking.save({ session });

    // Update Payment status
    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: PaymentStatus.COMPLETED,
        transactionId: `CASH-${Date.now()}`,
      }).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    // Create Notification for the guest
    await Notification.create({
      recipient: booking.guestId,
      message: `Payment for booking ${booking.bookingCode} was successfully confirmed.`,
      type: NotificationType.STATUS_UPDATE,
      link: '/my-reservations'
    });

    res.json({ message: "Payment confirmed successfully", booking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error confirming payment", error });
  }
};

export const getInvoice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("guestId", "fullName email")
      .populate("bookedRooms.roomId", "roomNumber")
      .populate("paymentId");

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoice data", error });
  }
};

export const getBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    const totalBookings = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("guestId")
      .populate("bookedRooms.roomId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const standardizedBookings = bookings.map((b) => {
      const bookingObj = b.toObject();
      return {
        ...bookingObj,
        user: bookingObj.guestId,
        room: bookingObj.bookedRooms?.[0]?.roomId,
        guests: (bookingObj.adultsCount || 0) + (bookingObj.childrenCount || 0),
      };
    });

    res.json({
      bookings: standardizedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasNext: page * limit < totalBookings,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await Booking.find({ guestId: req.user?.id })
      .populate("bookedRooms.roomId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your bookings", error });
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Capture old status to handle room status changes
    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // If checking out, set rooms to CLEANING and create housekeeping tasks
    if (
      status === BookingStatus.CHECKED_OUT &&
      oldStatus !== BookingStatus.CHECKED_OUT
    ) {
      const roomIds = booking.bookedRooms.map((br) => br.roomId);

      // Update room status
      await Room.updateMany(
        { _id: { $in: roomIds } },
        { status: RoomStatus.DIRTY },
      );

      // Create Housekeeping Logs for these rooms
      // Note: We'll try to find a housekeeping staff to assign if possible, or leave it for now
      // For simplicity, we'll create tasks as PENDING/DIRTY
      const HousekeepingLog = (await import("../models/HousekeepingLog"))
        .default;
      const { HousekeepingStatus } = await import("../models/HousekeepingLog");

      for (const roomId of roomIds) {
        await HousekeepingLog.create({
          roomId,
          status: HousekeepingStatus.DIRTY,
          task: "Checkout Cleaning",
          note: `Automatic task from Checkout of Booking ${booking.bookingCode}`,
        });
      }
    } else if (
      status === BookingStatus.CHECKED_IN &&
      oldStatus !== BookingStatus.CHECKED_IN
    ) {
      const roomIds = booking.bookedRooms.map((br) => br.roomId);
      await Room.updateMany(
        { _id: { $in: roomIds } },
        { status: RoomStatus.OCCUPIED },
      );
    }

    const updatedBooking = await Booking.findById(id)
      .populate("guestId")
      .populate("bookedRooms.roomId");
    if (!updatedBooking) {
      res.status(404).json({ message: "Booking not found after update" });
      return;
    }

    // Create Notification for status change
    await Notification.create({
      recipient: updatedBooking.guestId._id,
      message: `Your booking ${updatedBooking.bookingCode} status has been updated to ${status}.`,
      type: NotificationType.STATUS_UPDATE,
      link: '/my-reservations'
    });

    const bookingObj = updatedBooking.toObject();
    const standardizedResponse = {
      ...bookingObj,
      user: bookingObj.guestId,
      room: bookingObj.bookedRooms?.[0]?.roomId,
      guests: (bookingObj.adultsCount || 0) + (bookingObj.childrenCount || 0),
    };

    res.json(standardizedResponse);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error });
  }
};
