// scripts/fixImageUrls.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../src/models/Blog.js';
import User from '../src/models/User.js';

dotenv.config();

// ✅ Use the correct variable name
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

const fixImageUrls = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Update Blog thumbnails and cover images
    const blogResult = await Blog.updateMany(
      {
        $or: [
          { thumbnail: { $regex: /^http:\/\// } },
          { coverImage: { $regex: /^http:\/\// } }
        ]
      },
      [
        {
          $set: {
            thumbnail: {
              $cond: {
                if: { $regexMatch: { input: "$thumbnail", regex: /^http:\/\// } },
                then: { $replaceOne: { input: "$thumbnail", find: "http://", replacement: "https://" } },
                else: "$thumbnail"
              }
            },
            coverImage: {
              $cond: {
                if: { $regexMatch: { input: "$coverImage", regex: /^http:\/\// } },
                then: { $replaceOne: { input: "$coverImage", find: "http://", replacement: "https://" } },
                else: "$coverImage"
              }
            }
          }
        }
      ],
      { updatePipeline: true }
    );
    console.log(`✅ Updated ${blogResult.modifiedCount} blogs`);

    // 2. Update User avatars
    const userResult = await User.updateMany(
      { avatar: { $regex: /^http:\/\// } },
      [
        {
          $set: {
            avatar: {
              $replaceOne: { input: "$avatar", find: "http://", replacement: "https://" }
            }
          }
        }
      ],
      { updatePipeline: true }
    );
    console.log(`✅ Updated ${userResult.modifiedCount} users`);

    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixImageUrls();