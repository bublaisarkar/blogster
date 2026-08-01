import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage for avatars
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blogster/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }], // Square crop for avatars
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: fileFilter,
});

export default upload;