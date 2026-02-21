import mongoose from 'mongoose';
import Reservation, { ReservationStatus } from '../models/Reservation';
import Booking, { BookingStatus } from '../models/Booking';
import Room, { RoomStatus } from '../models/Room';

/**
 * Checks if a specific room is available for a given date range.
 * 
 * Overlap rule: requestedCheckIn < existingCheckOut AND requestedCheckOut > existingCheckIn
 * 
 * @param roomId The ID of the room to check.
 * @param checkIn Requested check-in date.
 * @param checkOut Requested check-out date.
 * @param excludeReservationId Optional reservation ID to exclude from the check (e.g., when updating or converting).
 * @param excludeBookingId Optional booking ID to exclude from the check.
 * @returns Promise<boolean> True if the room is available, false otherwise.
 */
export const isRoomAvailable = async (
  roomId: string | mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string | mongoose.Types.ObjectId,
  excludeBookingId?: string | mongoose.Types.ObjectId
): Promise<boolean> => {
  // 1. Check for overlapping Reservations
  const reservationQuery: any = {
    'reservedRooms.roomId': roomId,
    status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn }
  };

  if (excludeReservationId) {
    reservationQuery._id = { $ne: excludeReservationId };
  }

  const overlappingRes = await Reservation.findOne(reservationQuery);
  if (overlappingRes) return false;

  // 2. Check for overlapping Bookings
  const bookingQuery: any = {
    'bookedRooms.roomId': roomId,
    status: { $in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn }
  };

  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(bookingQuery);
  if (overlappingBooking) return false;

  // 3. Check Room status (ensure it's not in maintenance)
  const room = await Room.findById(roomId);
  if (!room || room.status === RoomStatus.MAINTENANCE) {
    return false;
  }

  // 4. Stricter check for same-day arrivals
  // If check-in is today, the room MUST be currently AVAILABLE (not cleaning or occupied)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate.getTime() === today.getTime()) {
    if (room.status !== RoomStatus.AVAILABLE) {
      return false;
    }
  }

  return true;
};

/**
 * Gets all available rooms of a specific type for a given date range.
 * 
 * @param roomTypeId The ID of the room type.
 * @param checkIn Requested check-in date.
 * @param checkOut Requested check-out date.
 * @returns Promise<IRoom[]> Array of available room documents.
 */
export const getAvailableRooms = async (
  roomTypeId: string | mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date
): Promise<any[]> => {
  const allRoomsOfType = await Room.find({ 
    roomTypeId, 
    status: { $ne: RoomStatus.MAINTENANCE } 
  });

  const availableRooms = [];
  for (const room of allRoomsOfType) {
    const isAvailable = await isRoomAvailable(room._id as mongoose.Types.ObjectId, checkIn, checkOut);
    if (isAvailable) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
};
