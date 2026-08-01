import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import Blog from '../src/models/Blog.js';
import User from '../src/models/User.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Upload to Cloudinary
const uploadToCloudinary = (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

// Helper: clean local path to filename
const getFilenameFromPath = (urlPath) => {
  // Remove leading slash if present
  const clean = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  // Extract filename from path
  const parts = clean.split('/');
  return parts[parts.length - 1];
};

// Migrate Blog images (coverImage, thumbnail, image)
const migrateBlogImages = async () => {
  const blogs = await Blog.find({
    $or: [
      { coverImage: { $exists: true, $ne: null } },
      { thumbnail: { $exists: true, $ne: null } },
      { image: { $exists: true, $ne: null } }
    ]
  });

  console.log(`📸 Found ${blogs.length} blogs with images`);

  for (const blog of blogs) {
    let fieldsToUpdate = {};

    // Check coverImage
    if (blog.coverImage && blog.coverImage.includes('/uploads/')) {
      const filename = getFilenameFromPath(blog.coverImage);
      const localFile = path.join(__dirname, '../uploads/blogs', filename);
      if (fs.existsSync(localFile)) {
        console.log(`⬆️ Uploading coverImage: ${filename}`);
        const url = await uploadToCloudinary(localFile, 'blogster/blogs');
        fieldsToUpdate.coverImage = url;
      }
    }

    // Check thumbnail
    if (blog.thumbnail && blog.thumbnail.includes('/uploads/')) {
      const filename = getFilenameFromPath(blog.thumbnail);
      const localFile = path.join(__dirname, '../uploads/blogs', filename);
      if (fs.existsSync(localFile)) {
        console.log(`⬆️ Uploading thumbnail: ${filename}`);
        const url = await uploadToCloudinary(localFile, 'blogster/blogs');
        fieldsToUpdate.thumbnail = url;
      }
    }

    // Check image (legacy field)
    if (blog.image && blog.image.includes('/uploads/')) {
      const filename = getFilenameFromPath(blog.image);
      const localFile = path.join(__dirname, '../uploads/blogs', filename);
      if (fs.existsSync(localFile)) {
        console.log(`⬆️ Uploading image: ${filename}`);
        const url = await uploadToCloudinary(localFile, 'blogster/blogs');
        fieldsToUpdate.image = url;
      }
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await Blog.findByIdAndUpdate(blog._id, fieldsToUpdate);
      console.log(`✅ Updated blog ${blog._id}`);
    }
  }
};

// Migrate User avatars
const migrateAvatars = async () => {
  const users = await User.find({ avatar: { $exists: true, $ne: null } });
  console.log(`👤 Found ${users.length} users with avatars`);

  for (const user of users) {
    if (user.avatar && user.avatar.includes('/uploads/')) {
      const filename = getFilenameFromPath(user.avatar);
      const localFile = path.join(__dirname, '../uploads/avatars', filename);
      if (fs.existsSync(localFile)) {
        console.log(`⬆️ Uploading avatar: ${filename}`);
        const url = await uploadToCloudinary(localFile, 'blogster/avatars');
        await User.findByIdAndUpdate(user._id, { avatar: url });
        console.log(`✅ Updated user ${user._id}`);
      }
    }
  }
};

// Optional: Migrate root-level images (if they belong somewhere)
const migrateRootImages = async () => {
  const rootFiles = fs.readdirSync(path.join(__dirname, '../uploads'))
    .filter(f => !fs.statSync(path.join(__dirname, '../uploads', f)).isDirectory());

  if (rootFiles.length === 0) return;

  console.log(`📁 Found ${rootFiles.length} root-level images.`);
  console.log('These may be unused or referenced elsewhere. Skipping. If you need them, upload manually.');

  // Uncomment below to upload them to a generic folder
  // for (const file of rootFiles) {
  //   const localFile = path.join(__dirname, '../uploads', file);
  //   const url = await uploadToCloudinary(localFile, 'blogster/misc');
  //   console.log(`⬆️ Uploaded root image: ${file} -> ${url}`);
  // }
};

const runMigration = async () => {
  try {
    await connectDB();
    await migrateBlogImages();
    await migrateAvatars();
    await migrateRootImages();
    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
};

runMigration();