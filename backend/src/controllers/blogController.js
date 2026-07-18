// controllers/blogController.js
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// ✅ IMAGE UPLOAD
// ============================================================

/**
 * @desc    Upload image for blog content
 * @route   POST /api/blogs/upload-image
 * @access  Private (Admin/Author)
 */
export const uploadImage = async (req, res) => {
  try {
    // ✅ Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // ✅ Get the uploaded file URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${baseUrl}/uploads/blogs/${req.file.filename}`;
    
    // ✅ Return the image URL
    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    
    // ✅ Clean up uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/blogs', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// ============================================================
// ✅ BLOG CRUD OPERATIONS
// ============================================================

/**
 * @desc    Get all blogs
 * @route   GET /api/blogs
 * @access  Public
 */
export const getBlogs = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10, featured } = req.query;
    const query = {};

    // Handle status filter
    if (status) {
      if (status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'published';
    }

    // Featured filter
    if (featured) {
      query.featured = featured === 'true';
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: category }, { name: category }]
      });
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      } else {
        query.category = { $regex: category, $options: 'i' };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar bio')
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    console.error('❌ Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single blog by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('categories', 'name slug');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('❌ Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get blog by slug
 * @route   GET /api/blogs/slug/:slug
 * @access  Public
 */
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
      .populate('author', 'name avatar bio')
      .populate('categories', 'name slug');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('❌ Get blog by slug error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create blog
 * @route   POST /api/blogs
 * @access  Private
 */
export const createBlog = async (req, res) => {
  try {
    console.log('📝 Creating blog with user:', req.user._id);
    console.log('📝 Blog data:', req.body);

    const { 
      title, 
      content, 
      categories, 
      tags,
      thumbnail, 
      coverImage,
      status, 
      allowComments,
      category,
      featured,
      seo
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content'
      });
    }

    // Generate slug
    let slug = slugify(title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // Check if slug already exists and make it unique
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      const randomNum = Math.floor(Math.random() * 1000);
      slug = `${slug}-${randomNum}`;
    }

    // Handle categories
    let categoryIds = [];
    let categoryNames = [];

    if (categories && Array.isArray(categories)) {
      for (const cat of categories) {
        if (typeof cat === 'string') {
          if (cat.match(/^[0-9a-fA-F]{24}$/)) {
            categoryIds.push(cat);
          } else {
            categoryNames.push(cat.trim());
          }
        } else if (cat._id) {
          categoryIds.push(cat._id);
        } else if (cat.name) {
          categoryNames.push(cat.name.trim());
        }
      }
    } else if (category) {
      categoryNames.push(category.trim());
    }

    // Find or create categories
    if (categoryNames.length > 0) {
      for (const name of categoryNames) {
        let categoryDoc = await Category.findOne({ 
          $or: [
            { name: { $regex: new RegExp(`^${name}$`, 'i') } },
            { slug: slugify(name, { lower: true, strict: true }) }
          ]
        });
        
        if (!categoryDoc) {
          categoryDoc = await Category.create({
            name: name,
            slug: slugify(name, { lower: true, strict: true })
          });
        }
        categoryIds.push(categoryDoc._id);
      }
    }

    // Generate excerpt from content
    const plainText = content.replace(/<[^>]*>/g, '');
    const excerpt = plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');

    // Handle tags
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(t => t.trim()).filter(t => t);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Get image URL
    const imageUrl = coverImage || thumbnail || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop&crop=center&auto=format';

    const blogData = {
      title,
      slug,
      content,
      excerpt,
      categories: categoryIds,
      tags: processedTags,
      coverImage: imageUrl,
      thumbnail: imageUrl,
      status: status || 'draft',
      allowComments: allowComments !== undefined ? allowComments : true,
      author: req.user._id,
      featured: featured || false,
      publishedAt: status === 'published' ? new Date() : null,
      seo: seo || {
        title: title,
        description: excerpt,
        keywords: processedTags
      }
    };

    const blog = await Blog.create(blogData);

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name avatar')
      .populate('categories', 'name slug');

    console.log('✅ Blog created:', blog.title);

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    console.error('❌ Create blog error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating blog'
    });
  }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 * @access  Private
 */
export const updateBlog = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      categories, 
      tags,
      thumbnail, 
      coverImage,
      status, 
      allowComments,
      featured,
      seo
    } = req.body;
    
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check authorization
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // Update fields
    if (title) {
      blog.title = title;
      let newSlug = slugify(title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      
      const existingBlog = await Blog.findOne({ 
        slug: newSlug, 
        _id: { $ne: blog._id } 
      });
      if (existingBlog) {
        const randomNum = Math.floor(Math.random() * 1000);
        newSlug = `${newSlug}-${randomNum}`;
      }
      blog.slug = newSlug;
    }

    if (content) {
      blog.content = content;
      const plainText = content.replace(/<[^>]*>/g, '');
      blog.excerpt = plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    }

    // Handle categories update
    if (categories) {
      let categoryIds = [];
      let categoryNames = [];

      if (Array.isArray(categories)) {
        for (const cat of categories) {
          if (typeof cat === 'string') {
            if (cat.match(/^[0-9a-fA-F]{24}$/)) {
              categoryIds.push(cat);
            } else {
              categoryNames.push(cat.trim());
            }
          } else if (cat._id) {
            categoryIds.push(cat._id);
          } else if (cat.name) {
            categoryNames.push(cat.name.trim());
          }
        }
      }

      if (categoryNames.length > 0) {
        for (const name of categoryNames) {
          let categoryDoc = await Category.findOne({ 
            $or: [
              { name: { $regex: new RegExp(`^${name}$`, 'i') } },
              { slug: slugify(name, { lower: true, strict: true }) }
            ]
          });
          
          if (!categoryDoc) {
            categoryDoc = await Category.create({
              name: name,
              slug: slugify(name, { lower: true, strict: true })
            });
          }
          categoryIds.push(categoryDoc._id);
        }
      }

      blog.categories = categoryIds;
    }

    // Handle tags update
    if (tags) {
      if (Array.isArray(tags)) {
        blog.tags = tags.map(t => t.trim()).filter(t => t);
      } else if (typeof tags === 'string') {
        blog.tags = tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Handle image update
    if (coverImage) {
      blog.coverImage = coverImage;
      blog.thumbnail = coverImage;
    } else if (thumbnail) {
      blog.coverImage = thumbnail;
      blog.thumbnail = thumbnail;
    }

    if (status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    if (allowComments !== undefined) {
      blog.allowComments = allowComments;
    }

    if (featured !== undefined) {
      blog.featured = featured;
    }

    if (seo) {
      blog.seo = { ...blog.seo, ...seo };
    }

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name avatar')
      .populate('categories', 'name slug');

    console.log('✅ Blog updated:', blog.title);

    res.status(200).json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    console.error('❌ Update blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 * @access  Private
 */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await blog.deleteOne();

    console.log('✅ Blog deleted:', blog.title);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ BLOG MANAGEMENT
// ============================================================

/**
 * @desc    Publish blog
 * @route   PUT /api/blogs/:id/publish
 * @access  Private
 */
export const publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this blog'
      });
    }

    blog.status = 'published';
    blog.publishedAt = new Date();
    await blog.save();

    console.log('✅ Blog published:', blog.title);

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('❌ Publish blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Unpublish blog
 * @route   PUT /api/blogs/:id/unpublish
 * @access  Private
 */
export const unpublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unpublish this blog'
      });
    }

    blog.status = 'draft';
    await blog.save();

    console.log('✅ Blog unpublished:', blog.title);

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('❌ Unpublish blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Increment view count
 * @route   PUT /api/blogs/:id/view
 * @access  Public
 */
export const incrementView = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog not found' 
      });
    }
    blog.views += 1;
    await blog.save();
    res.status(200).json({ 
      success: true, 
      data: { views: blog.views } 
    });
  } catch (error) {
    console.error('❌ Increment view error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================================
// ✅ BLOG QUERIES
// ============================================================

/**
 * @desc    Get popular blogs
 * @route   GET /api/blogs/popular
 * @access  Public
 */
export const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5, days = 30, sortBy = 'views' } = req.query;

    const query = { status: 'published' };

    if (days && days !== 'all') {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.createdAt = { $gte: date };
    }

    const sort = {};
    if (sortBy === 'views') {
      sort.views = -1;
    } else if (sortBy === 'commentCount') {
      sort.commentCount = -1;
    } else if (sortBy === 'likes') {
      sort.likes = -1;
    } else {
      sort.views = -1;
    }
    sort.createdAt = -1;

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .populate('categories', 'name slug')
      .sort(sort)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('❌ Get popular blogs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get latest blogs
 * @route   GET /api/blogs/latest
 * @access  Public
 */
export const getLatestBlogs = async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name avatar')
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('❌ Get latest blogs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get related blogs
 * @route   GET /api/blogs/related
 * @access  Public
 */
export const getRelatedBlogs = async (req, res) => {
  try {
    const { postId, category, tags, limit = 3 } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const currentBlog = await Blog.findById(postId);
    if (!currentBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const query = {
      _id: { $ne: postId },
      status: 'published'
    };

    const conditions = [];

    if (category) {
      conditions.push({ categories: { $in: [category] } });
    } else if (currentBlog.categories && currentBlog.categories.length > 0) {
      conditions.push({ categories: { $in: currentBlog.categories } });
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      conditions.push({ tags: { $in: tagArray } });
    } else if (currentBlog.tags && currentBlog.tags.length > 0) {
      conditions.push({ tags: { $in: currentBlog.tags } });
    }

    if (conditions.length > 0) {
      query.$or = conditions;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .populate('categories', 'name slug')
      .limit(parseInt(limit))
      .sort({ views: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('❌ Get related blogs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get featured blogs
 * @route   GET /api/blogs/featured
 * @access  Public
 */
export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const blogs = await Blog.find({ 
      status: 'published',
      featured: true 
    })
      .populate('author', 'name avatar')
      .populate('categories', 'name slug')
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('❌ Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ BLOG STATS & ANALYTICS
// ============================================================

/**
 * @desc    Get blog statistics
 * @route   GET /api/blogs/stats
 * @access  Private (Admin)
 */
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    const archivedBlogs = await Blog.countDocuments({ status: 'archived' });
    
    const viewsResult = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    const commentsResult = await Blog.aggregate([
      { $group: { _id: null, totalComments: { $sum: '$commentCount' } } }
    ]);
    const totalComments = commentsResult.length > 0 ? commentsResult[0].totalComments : 0;

    const likesResult = await Blog.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);
    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    const categoryStats = await Blog.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const categoryIds = categoryStats.map(c => c._id);
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryData = categoryStats.map(stat => {
      const category = categories.find(c => c._id.toString() === stat._id.toString());
      return {
        category: category ? category.name : 'Unknown',
        count: stat.count
      };
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalBlogs,
        published: publishedBlogs,
        drafts: draftBlogs,
        archived: archivedBlogs,
        totalViews,
        totalComments,
        totalLikes,
        categoryBreakdown: categoryData
      }
    });
  } catch (error) {
    console.error('❌ Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get blog analytics
 * @route   GET /api/blogs/:id/analytics
 * @access  Private (Author/Admin)
 */
export const getBlogAnalytics = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this blog\'s analytics'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        views: blog.views,
        commentCount: blog.commentCount,
        likes: blog.likes || 0,
        createdAt: blog.createdAt,
        publishedAt: blog.publishedAt,
        categories: blog.categories,
        tags: blog.tags
      }
    });
  } catch (error) {
    console.error('❌ Get blog analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ LIKES
// ============================================================

/**
 * @desc    Toggle like on blog
 * @route   PUT /api/blogs/:id/like
 * @access  Private
 */
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const userId = req.user._id;
    const likedIndex = blog.likedBy ? blog.likedBy.indexOf(userId) : -1;

    if (likedIndex === -1) {
      if (!blog.likedBy) blog.likedBy = [];
      blog.likedBy.push(userId);
      blog.likes = (blog.likes || 0) + 1;
      await blog.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog liked successfully',
        data: { likes: blog.likes, liked: true }
      });
    } else {
      blog.likedBy.splice(likedIndex, 1);
      blog.likes = Math.max(0, (blog.likes || 0) - 1);
      await blog.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog unliked successfully',
        data: { likes: blog.likes, liked: false }
      });
    }
  } catch (error) {
    console.error('❌ Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Check if user liked a blog
 * @route   GET /api/blogs/:id/like-status
 * @access  Private
 */
export const getLikeStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const userId = req.user._id;
    const isLiked = blog.likedBy ? blog.likedBy.includes(userId) : false;

    res.status(200).json({
      success: true,
      isLiked,
      likes: blog.likes || 0
    });
  } catch (error) {
    console.error('❌ Get like status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ COMMENTS
// ============================================================

/**
 * @desc    Add comment to blog
 * @route   POST /api/blogs/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const blogId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (!blog.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this post'
      });
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      author: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    if (!blog.comments) {
      blog.comments = [];
    }
    blog.comments.push(comment);
    blog.commentCount = (blog.commentCount || 0) + 1;
    await blog.save();

    const populatedBlog = await Blog.findById(blogId)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete comment from blog
 * @route   DELETE /api/blogs/:id/comments/:commentId
 * @access  Private
 */
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const commentIndex = blog.comments.findIndex(
      c => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = blog.comments[commentIndex];
    
    if (comment.author.toString() !== req.user._id.toString() && 
        blog.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    blog.comments.splice(commentIndex, 1);
    blog.commentCount = Math.max(0, (blog.commentCount || 1) - 1);
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update comment
 * @route   PUT /api/blogs/:id/comments/:commentId
 * @access  Private
 */
export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const commentIndex = blog.comments.findIndex(
      c => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = blog.comments[commentIndex];
    
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment'
      });
    }

    blog.comments[commentIndex].content = content.trim();
    blog.comments[commentIndex].editedAt = new Date();
    await blog.save();

    const populatedBlog = await Blog.findById(id)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar');

    res.status(200).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    console.error('❌ Update comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get comments for a blog
 * @route   GET /api/blogs/:id/comments
 * @access  Public
 */
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const blog = await Blog.findById(id)
      .populate('comments.author', 'name avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comments = blog.comments || [];
    const total = comments.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedComments = comments.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedComments.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: paginatedComments
    });
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};