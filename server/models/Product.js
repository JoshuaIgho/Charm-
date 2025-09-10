const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxLength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: [
        'rings',
        'necklaces', 
        'earrings',
        'bracelets',
        'pendants',
        'chains',
        'anklets',
        'sets',
        'accessories'
      ],
      message: 'Category is not supported'
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    required: [true, 'Material is required'],
    enum: {
      values: ['gold', 'silver', 'platinum', 'stainless-steel', 'copper', 'mixed'],
      message: 'Material is not supported'
    }
  },
  materialPurity: {
    type: String, // e.g., "18k", "14k", "925", etc.
    trim: true
  },
  gemstone: {
    type: String,
    enum: ['diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'cubic-zirconia', 'none'],
    default: 'none'
  },
  weight: {
    value: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    unit: {
      type: String,
      enum: ['g', 'kg', 'oz'],
      default: 'g'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm', 'inch'],
      default: 'mm'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    publicId: String // For Cloudinary
  }],
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'low_stock', 'discontinued'],
      default: 'out_of_stock'
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isNewStock: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleEndDate: {
    type: Date
  },
  sku: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness for non-null values
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  seo: {
    metaTitle: {
      type: String,
      maxLength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxLength: [160, 'Meta description cannot exceed 160 characters']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    }
  },
  reviews: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  return this.stock.status === 'in_stock' && this.stock.quantity > this.stock.reserved && this.isActive;
});

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.stock.quantity - this.stock.reserved);
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Auto-generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    // Generate SKU based on category and timestamp
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}${timestamp}`;
  }
  next();
});

// Auto-generate slug if not provided
productSchema.pre('save', function(next) {
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Update stock status based on quantity
productSchema.pre('save', function(next) {
  if (this.isModified('stock.quantity')) {
    if (this.stock.quantity <= 0) {
      this.stock.status = 'out_of_stock';
    } else if (this.stock.quantity <= this.stock.lowStockThreshold) {
      this.stock.status = 'low_stock';
    } else {
      this.stock.status = 'in_stock';
    }
  }
  next();
});

// Ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length === 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      // Keep only the last marked as primary
      this.images.forEach((img, index) => {
        img.isPrimary = index === this.images.length - 1 && img.isPrimary;
      });
    }
  }
  next();
});

// Index for search and performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'stock.status': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewStock: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Method to reserve stock
productSchema.methods.reserveStock = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.stock.reserved += quantity;
    return this.save();
  } else {
    throw new Error('Insufficient stock available');
  }
};

// Method to release reserved stock
productSchema.methods.releaseStock = function(quantity) {
  this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
  return this.save();
};

// Method to reduce actual stock (when order is confirmed)
productSchema.methods.reduceStock = function(quantity) {
  if (this.stock.quantity >= quantity) {
    this.stock.quantity -= quantity;
    this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
    return this.save();
  } else {
    throw new Error('Insufficient stock');
  }
};

module.exports = mongoose.model('Product', productSchema);