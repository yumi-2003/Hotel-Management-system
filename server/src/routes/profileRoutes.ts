import express from 'express';
import { getProfile, updateProfile, uploadImage } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadProfileImage } from '../middleware/upload';

const router = express.Router();

// All routes require authentication
router.use(authenticate as any);

router.get('/', getProfile as any);
router.put('/', updateProfile as any);
router.post('/image', uploadProfileImage.single('profileImage'), uploadImage as any);

export default router;
