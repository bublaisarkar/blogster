import mongoose from 'mongoose';

const blogSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  blogTitle: {
    type: String,
    default: 'My Blog'
  },
  tagline: {
    type: String,
    default: ''
  },
  defaultCategory: {
    type: String,
    default: 'General'
  },
  postsPerPage: {
    type: Number,
    default: 10
  },
  commentModeration: {
    type: String,
    enum: ['auto-approve', 'manual', 'disable'],
    default: 'auto-approve'
  },
  allowSearchEngines: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'light'
  },
  accentColor: {
    type: String,
    default: 'indigo'
  }
}, {
  timestamps: true
});

const BlogSettings = mongoose.model('BlogSettings', blogSettingsSchema);
export default BlogSettings;