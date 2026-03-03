import Booking, { BookingStatus } from '../models/Booking';
import User from '../models/User';
import Notification, { NotificationType } from '../models/Notification';
import { UserRole } from '../models/User';

/**
 * Generates two Date objects representing the start (00:00:00) and
 * end (23:59:59) of today in local server time.
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Core job logic. Finds today's check-ins and check-outs, then creates
 * a summary notification for each eligible staff member.
 * Uses an idempotency check (same message + same recipient + same day)
 * so server restarts don't produce duplicate notifications.
 */
export const runDailyNotificationJob = async () => {
  try {
    const { start, end } = getTodayRange();

    // --- 1. Query bookings ---
    const [checkIns, checkOuts] = await Promise.all([
      Booking.find({
        checkInDate: { $gte: start, $lte: end },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CONFIRMED_UNPAID] },
      }),
      Booking.find({
        checkOutDate: { $gte: start, $lte: end },
        status: BookingStatus.CHECKED_IN,
      }),
    ]);

    // --- 2. Fetch staff users ---
    const staffUsers = await User.find({
      role: { $in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST] },
    }).select('_id');

    if (staffUsers.length === 0) {
      console.log('[DAILY-NOTIF] No staff users found, skipping.');
      return;
    }

    const notifications: {
      recipient: typeof staffUsers[0]['_id'];
      message: string;
      type: NotificationType;
      link: string;
    }[] = [];

    // --- 3. Build check-in notifications ---
    if (checkIns.length > 0) {
      const message = `📋 Today's Check-ins: ${checkIns.length} booking(s) are due for check-in today. Please prepare the rooms and welcome the guests.`;
      for (const staff of staffUsers) {
        // Idempotency: skip if this exact notification already exists today
        const exists = await Notification.findOne({
          recipient: staff._id,
          message,
          createdAt: { $gte: start, $lte: end },
        });
        if (!exists) {
          notifications.push({
            recipient: staff._id,
            message,
            type: NotificationType.CHECK_IN,
            link: '/staff/bookings',
          });
        }
      }
    }

    // --- 4. Build check-out notifications ---
    if (checkOuts.length > 0) {
      const message = `🏁 Today's Check-outs: ${checkOuts.length} booking(s) are due for check-out today. Please coordinate room inspections and guest departures.`;
      for (const staff of staffUsers) {
        const exists = await Notification.findOne({
          recipient: staff._id,
          message,
          createdAt: { $gte: start, $lte: end },
        });
        if (!exists) {
          notifications.push({
            recipient: staff._id,
            message,
            type: NotificationType.CHECK_OUT,
            link: '/staff/bookings',
          });
        }
      }
    }

    // --- 5. Persist notifications ---
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`[DAILY-NOTIF] Created ${notifications.length} daily notification(s) for staff.`);
    } else {
      console.log('[DAILY-NOTIF] No new notifications to create today.');
    }
  } catch (error) {
    console.error('[DAILY-NOTIF] Error running daily notification job:', error);
  }
};

/**
 * Schedules the daily notification job to run immediately on startup,
 * then repeat every 24 hours.
 */
export const scheduleDailyNotifications = () => {
  console.log('[DAILY-NOTIF] Starting daily notification scheduler...');

  // Run immediately on startup
  runDailyNotificationJob();

  // Then repeat every 24 hours
  setInterval(runDailyNotificationJob, 24 * 60 * 60 * 1000);
};
