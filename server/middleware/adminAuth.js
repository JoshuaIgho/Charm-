const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to protect admin routes
const adminProtect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin token required.'
      });
    }

    try {
      // Verify token with admin secret
      const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
      
      // Get admin from token
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token. Admin not found.'
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account has been deactivated.'
        });
      }

      if (admin.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Admin account is temporarily locked. Please try again later.'
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save({ validateBeforeSave: false });

      // Add admin to request object
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token.'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in admin authentication.'
    });
  }
};

// Check specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required.'
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${permission} permission required.`
      });
    }

    next();
  };
};

// Check if admin is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  next();
};

// Generate admin JWT token
const generateAdminToken = (id) => {
  return jwt.sign({ id, type: 'admin' }, process.env.JWT_ADMIN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send admin token response
const sendAdminTokenResponse = (admin, statusCode, res) => {
  const token = generateAdminToken(admin._id);

  // Remove password from output
  admin.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      admin: admin.getSafeProfile()
    }
  });
};

// Middleware to log admin actions
const logAdminAction = (action) => {
  return (req, res, next) => {
    // Store action info for logging after response
    req.adminAction = {
      action,
      adminId: req.admin?._id,
      adminUsername: req.admin?.username,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      route: req.originalUrl,
      method: req.method
    };
    
    // Log the action (in production, you might want to save this to database)
    console.log(`[ADMIN ACTION] ${req.admin?.username} performed ${action} at ${req.originalUrl}`);
    
    next();
  };
};

module.exports = {
  adminProtect,
  checkPermission,
  requireSuperAdmin,
  generateAdminToken,
  sendAdminTokenResponse,
  logAdminAction
};