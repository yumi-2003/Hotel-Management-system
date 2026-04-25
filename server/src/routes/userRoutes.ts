import express from 'express';
import { getAllUsers, createStaffUser, updateUserStatus, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { UserRole } from '../types/enums';

const router = express.Router();

// 1. Require JWT Authentication for all routes below
router.use(authenticate);

// 2. Enforce Role-Based Access Control (RBAC) per route
// Receptionist needs access to get all users to assign housekeeping tasks
router.get('/', authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST]), getAllUsers);

// Only administrators and managers can modify staff accounts
router.post('/staff', authorize([UserRole.ADMIN, UserRole.MANAGER]), createStaffUser);
router.put('/:id/status', authorize([UserRole.ADMIN, UserRole.MANAGER]), updateUserStatus);
router.put('/:id/role', authorize([UserRole.ADMIN, UserRole.MANAGER]), updateUserRole);
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.MANAGER]), deleteUser);

export default router;
