const AccessorySandFilter = require('../models/AccessorySandFilter');
const AccessoryCarbonFilter = require('../models/AccessoryCarbonFilter');

const models = {
  'sand-filter': AccessorySandFilter,
  'carbon-filter': AccessoryCarbonFilter  
};

const getProducts = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid product type' });
    }

    const products = await Model.find().sort({ createdAt: -1 });
    res.json({ products, totalProducts: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid product type' });
    }

    const product = new Model(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid product type' });
    }

    const product = await Model.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];
    
    if (!Model) {
      return res.status(400).json({ message: 'Invalid product type' });
    }

    const product = await Model.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};