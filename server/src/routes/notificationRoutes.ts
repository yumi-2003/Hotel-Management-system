import express from 'express';
import { authenticate } from '../middleware/auth';
import { getMyNotifications, markNotificationAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markNotificationAsRead);

export default router;
