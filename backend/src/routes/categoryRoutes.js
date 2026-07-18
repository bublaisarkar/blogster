import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// ✅ Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/slug/:slug', getCategoryBySlug);

// ✅ Admin only routes
router.post('/', auth, authorize('admin'), createCategory);
router.put('/:id', auth, authorize('admin'), updateCategory);
router.delete('/:id', auth, authorize('admin'), deleteCategory);

export default router;