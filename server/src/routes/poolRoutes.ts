import express from 'express';
import { getPoolStatus, updatePoolStatus } from '../controllers/poolController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', getPoolStatus);
router.put('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), updatePoolStatus as any);

export default router;
