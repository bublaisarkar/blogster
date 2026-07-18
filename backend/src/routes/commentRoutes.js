import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getComments,
  getCommentsByBlog,
  createComment,
  updateCommentStatus,
  deleteComment,
  getCommentCount,
  getCommentStats,
  likeComment
} from '../controllers/commentController.js';

const router = express.Router();

// ✅ Public routes - SPECIFIC routes first
router.get('/stats', auth, authorize('admin'), getCommentStats);
router.get('/blog/:blogId', getCommentsByBlog);
router.get('/count/:blogId', getCommentCount);
router.get('/', getComments);
router.post('/', createComment);
router.put('/:id/like', likeComment);

// ✅ Private routes - These have :id parameter, so they should come AFTER specific routes
router.put('/:id/status', auth, updateCommentStatus);
router.delete('/:id', auth, deleteComment);

export default router;