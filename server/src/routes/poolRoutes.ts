import express from 'express';
import { getPoolStatus, updatePoolStatus, getPoolSlots, reservePoolSlot, cancelPoolReservation } from '../controllers/poolController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', getPoolStatus as any);
router.put('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), updatePoolStatus as any);

// Slot & Reservation Routes
router.get('/slots', getPoolSlots as any);
router.post('/reserve', authenticate, reservePoolSlot as any);
router.patch('/reservation/:id/cancel', authenticate, cancelPoolReservation as any);

export default router;
