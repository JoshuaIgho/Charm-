const express = require('express');
const { body } = require('express-validator');
const {
   register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  adminLogin,
  googleAdminLogin
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/adminAuth');

const router = express.Router();

// USER AUTHENTICATION ROUTES

// @route   POST /api/auth/register
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], register);

// @route   POST /api/auth/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/profile', protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
], updateProfile);

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], changePassword);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], forgotPassword);

// @route   PUT /api/auth/reset-password/:resettoken
router.put('/reset-password/:resettoken', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], resetPassword);

// // ADMIN AUTHENTICATION ROUTES

// // @route   POST /api/auth/admin/login
// router.post('/admin/login', [
//   body('email')
//     .notEmpty()
//     .withMessage('Email or username is required'),
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required')
// ], adminLogin);

// // @route   GET /api/auth/admin/me
// router.get('/admin/me', adminProtect, getAdminMe);

// // @route   PUT /api/auth/admin/profile
// router.put('/admin/profile', adminProtect, [
//   body('firstName')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('First name must be between 2 and 50 characters'),
//   body('lastName')
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Last name must be between 2 and 50 characters')
// ], updateAdminProfile);

// // @route   PUT /api/auth/admin/change-password
// router.put('/admin/change-password', adminProtect, [
//   body('currentPassword')
//     .notEmpty()
//     .withMessage('Current password is required'),
//   body('newPassword')
//     .isLength({ min: 8 })
//     .withMessage('New password must be at least 8 characters')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
//     .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
// ], changeAdminPassword);

// // @route   POST /api/auth/admin/init
// // This route initializes the default super admin (only works if no super admin exists)
// router.post('/admin/init', initSuperAdmin);

module.exports = router;