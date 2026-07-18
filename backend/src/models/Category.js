import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please provide a category slug'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    default: ''
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters'],
    default: ''
  },
  metaKeywords: {
    type: String,
    maxlength: [200, 'Meta keywords cannot be more than 200 characters'],
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ Indexes (defined once)
categorySchema.index({ parentCategory: 1, isActive: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// ✅ Virtuals
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

categorySchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ✅ Static methods
categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

categorySchema.statics.getHierarchy = async function() {
  const categories = await this.find({ isActive: true }).sort({ order: 1 });
  const hierarchy = [];
  const map = {};

  categories.forEach(cat => {
    map[cat._id] = { ...cat.toObject(), children: [] };
  });

  categories.forEach(cat => {
    if (cat.parentCategory) {
      if (map[cat.parentCategory]) {
        map[cat.parentCategory].children.push(map[cat._id]);
      }
    } else {
      hierarchy.push(map[cat._id]);
    }
  });

  return hierarchy;
};

// ✅ Instance methods
categorySchema.methods.getSubcategories = function() {
  return this.constructor.find({ parentCategory: this._id, isActive: true });
};

// ✅ Ensure virtuals are included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;