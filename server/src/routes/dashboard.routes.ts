import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types/enums';

const router = express.Router();

// Protect dashboard routes
router.get('/stats', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.HOUSEKEEPING]), getDashboardStats);

export default router;
