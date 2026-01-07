const TopSellingProduct = require('../models/TopSellingProduct');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/top-selling/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all top selling products with pagination
const getAllTopSellingProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if request is from admin (has admin query param) or public
    const isAdminRequest = req.query.admin === 'true';
    
    let query = {};
    if (!isAdminRequest) {
      // For public/frontend, only show active products
      query = { isActive: { $ne: false }, stockStatus: 'In Stock' };
    }

    const totalProducts = await TopSellingProduct.countDocuments(query);
    const products = await TopSellingProduct.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalProducts,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get single product by ID
const getTopSellingProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await TopSellingProduct.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create new top selling product
const createTopSellingProduct = async (req, res) => {
  try {
    const { title, category, price, originalPrice, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    const image = req.file ? `/uploads/top-selling/${req.file.filename}` : null;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Handle specifications - it might come as string or array
    let specsArray = [];
    if (specifications) {
      if (typeof specifications === 'string') {
        try {
          specsArray = JSON.parse(specifications);
        } catch (e) {
          // If JSON.parse fails, treat as comma-separated string
          specsArray = specifications.split(',').map(s => s.trim()).filter(s => s);
        }
      } else if (Array.isArray(specifications)) {
        specsArray = specifications;
      }
    }

    const product = new TopSellingProduct({
      title,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      image,
      gst: gst ? parseFloat(gst) : 18,
      shippingCharges: shippingCharges ? parseFloat(shippingCharges) : 0,
      specifications: specsArray,
      stockStatus: stockStatus || 'In Stock',
      hsnSacCode: hsnSacCode || ''
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update top selling product
const updateTopSellingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, price, originalPrice, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    
    const product = await TopSellingProduct.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle specifications - it might come as string or array
    let specsArray = product.specifications;
    if (specifications !== undefined) {
      if (typeof specifications === 'string') {
        try {
          specsArray = JSON.parse(specifications);
        } catch (e) {
          // If JSON.parse fails, treat as comma-separated string
          specsArray = specifications.split(',').map(s => s.trim()).filter(s => s);
        }
      } else if (Array.isArray(specifications)) {
        specsArray = specifications;
      }
    }

    const updateData = {
      title: title || product.title,
      category: category || product.category,
      price: price ? parseFloat(price) : product.price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : product.originalPrice,
      gst: gst ? parseFloat(gst) : product.gst,
      shippingCharges: shippingCharges ? parseFloat(shippingCharges) : product.shippingCharges,
      specifications: specsArray,
      stockStatus: stockStatus || product.stockStatus,
      hsnSacCode: hsnSacCode !== undefined ? hsnSacCode : product.hsnSacCode
    };

    if (req.file) {
      updateData.image = `/uploads/top-selling/${req.file.filename}`;
    }

    const updatedProduct = await TopSellingProduct.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete top selling product
const deleteTopSellingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await TopSellingProduct.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await TopSellingProduct.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  getAllTopSellingProducts,
  getTopSellingProductById,
  createTopSellingProduct,
  updateTopSellingProduct,
  deleteTopSellingProduct,
  upload
};