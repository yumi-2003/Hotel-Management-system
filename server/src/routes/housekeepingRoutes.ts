import express from 'express';
import { createHousekeepingLog, getHousekeepingLogs, updateHousekeepingStatus, assignHousekeepingTask } from '../controllers/housekeepingController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types/enums';

const router = express.Router();

router.post('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING]), createHousekeepingLog);
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING]), getHousekeepingLogs);
router.patch('/:id/assign', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), assignHousekeepingTask);
router.patch('/:id/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING]), updateHousekeepingStatus);

export default router;
