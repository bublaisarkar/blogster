import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios'; // ✅ For EmailJS

// ============================================================
// ✅ Helper: Generate JWT Token
// ============================================================

const generateToken = (id, expiresIn = '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// ============================================================
// ✅ 1. REGISTER
// ============================================================

export const register = async (req, res) => {
  console.log('📝 Register controller called');
  console.log('📝 Request body:', req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      status: 'active'
    });

    const token = generateToken(user._id);

    console.log('✅ User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// ============================================================
// ✅ 2. LOGIN (with Remember Me)
// ============================================================

export const login = async (req, res) => {
  console.log('📝 Login controller called');
  console.log('📝 Request body:', req.body);

  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    // ✅ Token expiry based on "Remember Me"
    const expiresIn = rememberMe ? '7d' : '1d';
    const token = generateToken(user._id, expiresIn);

    console.log('✅ User logged in successfully:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// ============================================================
// ✅ 3. GET CURRENT USER
// ============================================================

export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ 4. UPDATE PROFILE
// ============================================================

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, socialLinks, avatar } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (socialLinks) user.socialLinks = socialLinks;
    if (avatar) user.avatar = avatar;

    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ 5. UPDATE PASSWORD
// ============================================================

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('❌ Update password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ 6. UPDATE SOCIAL LINKS
// ============================================================

export const updateSocialLinks = async (req, res) => {
  try {
    const { twitter, github, linkedin, website } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.socialLinks = {
      twitter: twitter || user.socialLinks?.twitter || '',
      github: github || user.socialLinks?.github || '',
      linkedin: linkedin || user.socialLinks?.linkedin || '',
      website: website || user.socialLinks?.website || ''
    };

    await user.save();

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      data: userResponse,
      message: 'Social links updated successfully'
    });
  } catch (error) {
    console.error('❌ Update social links error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ 7. UPLOAD AVATAR
// ============================================================

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

   const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar }
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================================
// ✅ 8. FORGOT PASSWORD (Generate Reset Token & Send Email)
// ============================================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpire = Date.now() + 3600000; // 1 hour

    // Hash and save token
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(resetToken, salt);
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // ✅ Send email using EmailJS with BOTH Private Key AND Public Key
    try {
      const response = await axios.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        {
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY, // ✅ Required: Public Key
          template_params: {
            to_email: user.email,
            name: user.name,
            reset_link: resetUrl,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EMAILJS_PRIVATE_KEY}`, // ✅ Optional but recommended
          },
        }
      );

      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ EmailJS error:', emailError.response?.data || emailError.message);
      // Don't fail the request if email fails (to avoid leaking user info)
    }

    // For development, log token (optional)
    console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reset email'
    });
  }
};

// ============================================================
// ✅ 9. RESET PASSWORD (Validate Token & Update)
// ============================================================

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find users with valid (non-expired) reset tokens
    const users = await User.find({
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken');

    let user = null;
    for (const u of users) {
      const isMatch = await bcrypt.compare(token, u.resetPasswordToken);
      if (isMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};