const WaterSoftener = require('../models/WaterSoftener');

// Get all water softeners with pagination
const getAllWaterSofteners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await WaterSoftener.countDocuments();
    const waterSofteners = await WaterSoftener.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      waterSofteners,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single water softener
const getWaterSoftener = async (req, res) => {
  try {
    const waterSoftener = await WaterSoftener.findById(req.params.id);
    if (!waterSoftener) {
      return res.status(404).json({ message: 'Water softener not found' });
    }
    res.json(waterSoftener);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create water softener
const createWaterSoftener = async (req, res) => {
  try {
    const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    
    const waterSoftener = new WaterSoftener({
      title,
      price,
      image,
      gst,
      shippingCharges,
      specifications: specifications || [],
      stockStatus: stockStatus || 'In Stock',
      hsnSacCode: hsnSacCode || ''
    });

    const savedWaterSoftener = await waterSoftener.save();
    res.status(201).json(savedWaterSoftener);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update water softener
const updateWaterSoftener = async (req, res) => {
  try {
    const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    
    const waterSoftener = await WaterSoftener.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        price, 
        image, 
        gst, 
        shippingCharges, 
        specifications: specifications || [], 
        stockStatus: stockStatus || 'In Stock',
        hsnSacCode: hsnSacCode || ''
      },
      { new: true, runValidators: true }
    );

    if (!waterSoftener) {
      return res.status(404).json({ message: 'Water softener not found' });
    }

    res.json(waterSoftener);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete water softener
const deleteWaterSoftener = async (req, res) => {
  try {
    const waterSoftener = await WaterSoftener.findByIdAndDelete(req.params.id);
    
    if (!waterSoftener) {
      return res.status(404).json({ message: 'Water softener not found' });
    }

    res.json({ message: 'Water softener deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllWaterSofteners,
  getWaterSoftener,
  createWaterSoftener,
  updateWaterSoftener,
  deleteWaterSoftener
};