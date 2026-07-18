import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';

/**
 * @desc    Get all comments
 * @route   GET /api/comments
 * @access  Public
 */
export const getComments = async (req, res) => {
  try {
    const { blogId, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (blogId) query.blog = blogId;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Comment.countDocuments(query);

    const comments = await Comment.find(query)
      .populate('author', 'name avatar')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: comments.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: comments
    });
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get comments for a specific blog
 * @route   GET /api/comments/blog/:blogId
 * @access  Public
 */
export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { status = 'approved' } = req.query;

    const comments = await Comment.find({
      blog: blogId,
      status: status
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('❌ Get comments by blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a comment
 * @route   POST /api/comments
 * @access  Public (or Private if authenticated)
 */
export const createComment = async (req, res) => {
  try {
    const { blogId, name, email, content, parentComment } = req.body;

    console.log('📝 Creating comment:', { blogId, name, email });

    // Validate
    if (!blogId || !name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blogId, name, email and content'
      });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog allows comments
    if (!blog.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this blog'
      });
    }

    // Check if parent comment exists (for replies)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Prepare comment data
    const commentData = {
      blog: blogId,
      name,
      email,
      content,
      parentComment: parentComment || null
    };

    // If user is authenticated, link to user account
    if (req.user) {
      commentData.author = req.user._id;
      // Use user's name and email if available
      commentData.name = req.user.name || name;
      commentData.email = req.user.email || email;
    }

    // Auto-approve if user is authenticated or admin
    if (req.user && (req.user.role === 'admin' || req.user.role === 'author')) {
      commentData.status = 'approved';
    } else {
      commentData.status = 'pending';
    }

    const comment = await Comment.create(commentData);

    // Populate author info for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar')
      .populate('blog', 'title slug');

    console.log('✅ Comment created:', comment._id);

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    console.error('❌ Create comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating comment'
    });
  }
};

/**
 * @desc    Update comment status (approve, reject, mark as spam)
 * @route   PUT /api/comments/:id/status
 * @access  Private (Admin/Author)
 */
export const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, approved, or spam'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization - only admin can update comments
    if (req.user.role !== 'admin') {
      // Authors can only update comments on their own blogs
      const blog = await Blog.findById(comment.blog);
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this comment'
        });
      }
    }

    comment.status = status;
    await comment.save();

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name avatar')
      .populate('blog', 'title slug');

    console.log(`✅ Comment ${status}:`, comment._id);

    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    console.error('❌ Update comment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Admin/Author)
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin') {
      const blog = await Blog.findById(comment.blog);
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this comment'
        });
      }
    }

    // Also delete all replies to this comment
    await Comment.deleteMany({ parentComment: id });

    await comment.deleteOne();

    console.log('✅ Comment deleted:', comment._id);

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
 * @desc    Get comment count for a blog
 * @route   GET /api/comments/count/:blogId
 * @access  Public
 */
export const getCommentCount = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { status = 'approved' } = req.query;

    const count = await Comment.countDocuments({
      blog: blogId,
      status: status
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Get comment count error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get comment statistics
 * @route   GET /api/comments/stats
 * @access  Private (Admin)
 */
export const getCommentStats = async (req, res) => {
  try {
    const total = await Comment.countDocuments();
    const approved = await Comment.countDocuments({ status: 'approved' });
    const pending = await Comment.countDocuments({ status: 'pending' });
    const spam = await Comment.countDocuments({ status: 'spam' });

    res.status(200).json({
      success: true,
      data: {
        total,
        approved,
        pending,
        spam
      }
    });
  } catch (error) {
    console.error('❌ Get comment stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Like a comment
 * @route   PUT /api/comments/:id/like
 * @access  Public
 */
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.likes += 1;
    await comment.save();

    res.status(200).json({
      success: true,
      likes: comment.likes
    });
  } catch (error) {
    console.error('❌ Like comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};