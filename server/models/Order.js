const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    price: Number,
    image: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
}, { _id: true });

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Nigeria'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow guest orders
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    code: String,
    reason: String
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      message: 'Status is not valid'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      message: 'Payment status is not valid'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash_on_delivery', 'wallet'],
    default: 'cash_on_delivery'
  },
  paymentDetails: {
    transactionId: String,
    gateway: String, // paystack, flutterwave, etc.
    gatewayResponse: mongoose.Schema.Types.Mixed,
    paidAt: Date
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: shippingAddressSchema,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'pickup'],
    default: 'standard'
  },
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  notes: {
    customer: String,
    admin: String
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    note: String
  }],
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  guestEmail: {
    type: String,
    lowercase: true
  },
  refund: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for customer email (works for both registered and guest orders)
orderSchema.virtual('customerEmail').get(function() {
  return this.guestEmail || (this.customer && this.customer.email) || this.shippingAddress.email;
});

// Virtual for full customer name
orderSchema.virtual('customerName').get(function() {
  if (this.customer && this.customer.fullName) {
    return this.customer.fullName;
  }
  return `${this.shippingAddress.firstName} ${this.shippingAddress.lastName}`;
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual to check if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual to check if order can be returned
orderSchema.virtual('canBeReturned').get(function() {
  return this.status === 'delivered' && this.orderAge <= 30; // 30 days return policy
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders for today to create unique number
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const todayOrdersCount = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    
    const orderSequence = String(todayOrdersCount + 1).padStart(3, '0');
    this.orderNumber = `TA${year}${month}${day}${orderSequence}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount.amount;
  
  // Ensure total is not negative
  this.totalAmount = Math.max(0, this.totalAmount);
  
  next();
});

// Add status change to history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Set guest order flag
orderSchema.pre('save', function(next) {
  this.isGuestOrder = !this.customer;
  if (this.isGuestOrder && !this.guestEmail) {
    this.guestEmail = this.shippingAddress.email;
  }
  next();
});

// Indexes for performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ guestEmail: 1 });
orderSchema.index({ 'shippingAddress.email': 1 });

// Method to add status update
orderSchema.methods.updateStatus = function(newStatus, updatedBy, note) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    note
  });
  return this.save();
};

// Method to calculate refund amount
orderSchema.methods.calculateRefundAmount = function() {
  if (this.paymentStatus === 'paid') {
    return this.totalAmount - (this.refund.amount || 0);
  }
  return 0;
};

// Method to process refund
orderSchema.methods.processRefund = function(amount, reason, processedBy) {
  this.refund = {
    amount: amount,
    reason: reason,
    processedAt: new Date(),
    processedBy: processedBy
  };
  
  if (amount >= this.totalAmount) {
    this.paymentStatus = 'refunded';
    this.status = 'refunded';
  } else {
    this.paymentStatus = 'partially_refunded';
  }
  
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);