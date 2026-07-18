import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// ✅ All routes require authentication and admin role
router.use(auth, authorize('admin'));

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;