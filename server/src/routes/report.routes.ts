import express from 'express';
import { exportRevenueExcel, exportRevenuePDF } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/revenue/excel', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), exportRevenueExcel);
router.get('/revenue/pdf', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), exportRevenuePDF);

export default router;
