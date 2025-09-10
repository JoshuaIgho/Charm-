const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendTokenResponse } = require('../middleware/auth');
const { sendAdminTokenResponse } = require('../middleware/adminAuth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Send token response
    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Send token response
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, dateOfBirth, gender } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to database
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // In production, send email with reset token
    // For now, we'll just return the token for testing
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset token sent',
      resetUrl // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
};

// ADMIN AUTHENTICATION

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for admin and include password
    const admin = await Admin.findOne({ 
      $or: [{ email }, { username: email }] 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await admin.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Send token response
    sendAdminTokenResponse(admin, 200, res);

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/admin/me
// @access  Private (Admin)
const getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({
      success: true,
      data: {
        admin: admin.getSafeProfile()
      }
    });
  } catch (error) {
    console.error('Get admin me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admin profile'
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/auth/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const admin = await Admin.findById(req.admin.id);
    
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        admin: admin.getSafeProfile()
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating admin profile'
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/auth/admin/change-password
// @access  Private (Admin)
const changeAdminPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin password updated successfully'
    });

  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing admin password'
    });
  }
};

// @desc    Initialize default super admin
// @route   POST /api/auth/admin/init
// @access  Public (only works if no super admin exists)
const initSuperAdmin = async (req, res) => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super admin already exists'
      });
    }

    // Create default super admin
    const superAdmin = await Admin.createDefaultSuperAdmin();

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: {
        admin: {
          username: superAdmin.username,
          email: superAdmin.email,
          role: superAdmin.role
        }
      }
    });

  } catch (error) {
    console.error('Init super admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating super admin'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  adminLogin,
  getAdminMe,
  updateAdminProfile,
  changeAdminPassword,
  initSuperAdmin
};