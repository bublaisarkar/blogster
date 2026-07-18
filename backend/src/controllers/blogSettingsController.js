import BlogSettings from '../models/BlogSettings.js';

/**
 * @desc    Get blog settings
 * @route   GET /api/blog-settings
 * @access  Private
 */
export const getBlogSettings = async (req, res) => {
  try {
    let settings = await BlogSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      // Create default settings
      settings = await BlogSettings.create({
        user: req.user._id,
        blogTitle: 'My Blog',
        tagline: '',
        defaultCategory: 'General',
        postsPerPage: 10,
        commentModeration: 'auto-approve',
        allowSearchEngines: true
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Get blog settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update blog settings
 * @route   PUT /api/blog-settings
 * @access  Private
 */
export const updateBlogSettings = async (req, res) => {
  try {
    const {
      blogTitle,
      tagline,
      defaultCategory,
      postsPerPage,
      commentModeration,
      allowSearchEngines,
      theme,
      accentColor
    } = req.body;

    let settings = await BlogSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new BlogSettings({ user: req.user._id });
    }

    if (blogTitle !== undefined) settings.blogTitle = blogTitle;
    if (tagline !== undefined) settings.tagline = tagline;
    if (defaultCategory !== undefined) settings.defaultCategory = defaultCategory;
    if (postsPerPage !== undefined) settings.postsPerPage = postsPerPage;
    if (commentModeration !== undefined) settings.commentModeration = commentModeration;
    if (allowSearchEngines !== undefined) settings.allowSearchEngines = allowSearchEngines;
    if (theme !== undefined) settings.theme = theme;
    if (accentColor !== undefined) settings.accentColor = accentColor;

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Blog settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Update blog settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};