const WaterSoftener = require('../models/WaterSoftener');

// Get all water softeners
const getAllWaterSofteners = async (req, res) => {
  try {
    const waterSofteners = await WaterSoftener.find().sort({ createdAt: -1 });
    res.json({ waterSofteners, total: waterSofteners.length });
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