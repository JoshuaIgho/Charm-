const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minLength: [3, 'Username must be at least 3 characters'],
    maxLength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'manager'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_products',
      'manage_orders', 
      'manage_users',
      'manage_admins',
      'view_analytics',
      'manage_settings'
    ]
  }],
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'manage_products', 'manage_orders', 'manage_users', 
          'manage_admins', 'view_analytics', 'manage_settings'
        ];
        break;
      case 'admin':
        this.permissions = [
          'manage_products', 'manage_orders', 'manage_users', 'view_analytics'
        ];
        break;
      case 'manager':
        this.permissions = ['manage_products', 'manage_orders', 'view_analytics'];
        break;
    }
  }
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// Method to handle failed login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to get safe admin profile (without sensitive data)
adminSchema.methods.getSafeProfile = function() {
  const adminObj = this.toObject();
  delete adminObj.password;
  delete adminObj.loginAttempts;
  delete adminObj.lockUntil;
  return adminObj;
};

// Static method to create default super admin
adminSchema.statics.createDefaultSuperAdmin = async function() {
  try {
    const existingSuperAdmin = await this.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('👑 Super admin already exists');
      return existingSuperAdmin;
    }

    const superAdmin = await this.create({
      username: 'superadmin',
      email: process.env.ADMIN_EMAIL || 'admin@ta-jewelry.com',
      password: process.env.ADMIN_PASSWORD || 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin'
    });

    console.log('👑 Default super admin created successfully');
    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating default super admin:', error);
    throw error;
  }
};

module.exports = mongoose.model('Admin', adminSchema);