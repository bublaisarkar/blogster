import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage for blog images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blogster/blogs', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Only image files are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter,
});

export default upload;