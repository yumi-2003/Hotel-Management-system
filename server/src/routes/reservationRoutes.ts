import express from 'express';
import { 
  createReservation, 
  getMyReservations, 
  getReservations, 
  updateReservationStatus,
  cancelMyReservation
} from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types/enums';

const router = express.Router();

router.post('/', authenticate, createReservation);
router.get('/my', authenticate, getMyReservations);
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), getReservations);
router.patch('/my/:id/cancel', authenticate, cancelMyReservation);
router.patch('/:id/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), updateReservationStatus);

export default router;
