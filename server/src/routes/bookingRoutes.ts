import express from 'express';
import { createBooking, getBookings, updateBookingStatus, confirmPayment, getInvoice, getMyBookings } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), getBookings);
router.patch('/:id/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), updateBookingStatus);
router.post('/:id/confirm-payment', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), confirmPayment);
router.get('/:id/invoice', authenticate, getInvoice);

export default router;
