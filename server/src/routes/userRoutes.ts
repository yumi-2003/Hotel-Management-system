import express from 'express';
import { getAllUsers, createStaffUser, updateUserStatus, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(authenticate);
router.use(authorize([UserRole.ADMIN, UserRole.MANAGER]));

router.get('/', getAllUsers);
router.post('/staff', createStaffUser);
router.put('/:id/status', updateUserStatus);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
