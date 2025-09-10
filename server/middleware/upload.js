const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
const productImagesDir = path.join(uploadsDir, 'products');
const userAvatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, productImagesDir, userAvatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'productImages') {
      uploadPath = productImagesDir;
    } else if (file.fieldname === 'avatar') {
      uploadPath = userAvatarsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const baseName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, baseName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      cb(new Error('File size too large. Maximum 5MB allowed.'), false);
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadProductImages = upload.array('productImages', 10);
const uploadSingleImage = upload.single('image');
const uploadUserAvatar = upload.single('avatar');

// Error handling middleware for multer
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed.') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  
  if (error.message === 'File size too large. Maximum 5MB allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  // Pass other errors to the next error handler
  next(error);
};

// Utility function to delete uploaded file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// Utility function to delete multiple files
const deleteFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    deleteFile(filePath);
  });
};

// Middleware to process uploaded product images
const processProductImages = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    req.uploadedImages = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/products/${file.filename}`
    }));
  }
  next();
};

// Middleware to validate image files before processing
const validateImages = (req, res, next) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (req.files) {
    const invalidFiles = req.files.filter(file => 
      !allowedTypes.includes(file.mimetype) || file.size > maxSize
    );
    
    if (invalidFiles.length > 0) {
      // Delete uploaded files
      req.files.forEach(file => deleteFile(file.path));
      
      return res.status(400).json({
        success: false,
        message: 'Invalid image files detected. Only JPEG, PNG, GIF, and WebP files under 5MB are allowed.'
      });
    }
  }
  
  next();
};

module.exports = {
  upload,
  uploadProductImages,
  uploadSingleImage,
  uploadUserAvatar,
  handleUploadErrors,
  deleteFile,
  deleteFiles,
  processProductImages,
  validateImages
};