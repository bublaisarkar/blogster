import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getBlogSettings,
  updateBlogSettings
} from '../controllers/blogSettingsController.js';

const router = express.Router();

router.get('/', auth, getBlogSettings);
router.put('/', auth, updateBlogSettings);

export default router;