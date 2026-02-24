import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import reservationRoutes from './routes/reservationRoutes';
import bookingRoutes from './routes/bookingRoutes';
import housekeepingRoutes from './routes/housekeepingRoutes';
import dashboardRoutes from './routes/dashboard.routes';
import profileRoutes from './routes/profileRoutes';
import userRoutes from './routes/userRoutes';
import poolRoutes from './routes/poolRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reportRoutes from './routes/report.routes';
import Reservation, { ReservationStatus } from './models/Reservation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
console.log('[SERVER] Initializing Notification Routes (v3)...');
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pool', poolRoutes);
app.use('/api/reports', reportRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI as string)
  .then(() => {
    console.log(' Successfully connected to MongoDB.');
    // Start auto-expiry job after successful connection
    startReservationExpiryJob();
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Reservation Auto-Expiry Job
const startReservationExpiryJob = () => {
  console.log('Starting Reservation Auto-Expiry Job...');
  // Check every 1 minute
  setInterval(async () => {
    try {
      const now = new Date();
      const result = await Reservation.updateMany(
        {
          status: ReservationStatus.PENDING,
          expiresAt: { $lt: now }
        },
        { status: ReservationStatus.EXPIRED }
      );
      if (result.modifiedCount > 0) {
        console.log(`[AUTO-EXPIRY] Marked ${result.modifiedCount} reservations as expired.`);
      }
    } catch (error) {
      console.error('[AUTO-EXPIRY] Error updating expired reservations:', error);
    }
  }, 60 * 1000); 
};

app.get('/', (req: Request, res: Response) => {
  res.send('Hotel Management System API is running...');
});

app.listen(PORT, () => {
  console.log(`[SERVER_START] Express server is listening on PORT: ${PORT}`);
});
