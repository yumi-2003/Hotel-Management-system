import express from 'express';
import { authenticate } from '../middleware/auth';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllNotifications } from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.delete('/clear-all', authenticate, deleteAllNotifications);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.patch('/:id/read', authenticate, markNotificationAsRead);

export default router;
