// routes/blogRoutes.js
import express from 'express';
import {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  getPopularBlogs,
  getLatestBlogs,
  getRelatedBlogs,
  getFeaturedBlogs,
  getBlogStats,
  getBlogAnalytics,
  toggleLike,
  getLikeStatus,
  addComment,
  deleteComment,
  updateComment,
  getComments,
  incrementView,
  uploadImage // ✅ Added uploadImage controller
} from '../controllers/blogController.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // ✅ Import upload middleware

const router = express.Router();

// ✅ Public routes
router.get('/', getBlogs);
router.get('/stats', auth, getBlogStats);
router.get('/popular', getPopularBlogs);
router.get('/latest', getLatestBlogs);
router.get('/related', getRelatedBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.get('/:id/comments', getComments);
router.get('/:id/like-status', auth, getLikeStatus);

// ✅ Image upload route (admin only)
router.post('/upload-image', 
  auth, 
  upload.single('image'), 
  uploadImage
);

// ✅ Protected routes
router.post('/', auth, createBlog);
router.put('/:id', auth, updateBlog);
router.delete('/:id', auth, deleteBlog);
router.put('/:id/view', auth, incrementView);

// ✅ Blog management routes
router.put('/:id/publish', auth, publishBlog);
router.put('/:id/unpublish', auth, unpublishBlog);
router.put('/:id/like', auth, toggleLike);

// ✅ Comment routes
router.post('/:id/comments', auth, addComment);
router.put('/:id/comments/:commentId', auth, updateComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);

// ✅ Admin only routes
router.get('/:id/analytics', auth, getBlogAnalytics);

export default router;