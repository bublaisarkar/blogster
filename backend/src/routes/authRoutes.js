import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  updatePassword,
  updateSocialLinks,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// ✅ Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ Private routes
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);
router.put('/social-links', auth, updateSocialLinks);

// ✅ Avatar upload
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

// ✅ Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working!'
  });
});

export default router;