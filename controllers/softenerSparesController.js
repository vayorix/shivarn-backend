const SoftenerSpares = require('../models/SoftenerSpares');

// Get all softener spares
const getAllSoftenerSpares = async (req, res) => {
  try {
    const softenerSpares = await SoftenerSpares.find().sort({ createdAt: -1 });
    res.json({ softenerSpares, total: softenerSpares.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single softener spare
const getSoftenerSpare = async (req, res) => {
  try {
    const softenerSpare = await SoftenerSpares.findById(req.params.id);
    if (!softenerSpare) {
      return res.status(404).json({ message: 'Softener spare not found' });
    }
    res.json(softenerSpare);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create softener spare
const createSoftenerSpare = async (req, res) => {
  try {
    const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    
    const softenerSpare = new SoftenerSpares({
      title,
      price,
      image,
      gst,
      shippingCharges,
      specifications: specifications || [],
      stockStatus: stockStatus || 'In Stock',
      hsnSacCode: hsnSacCode || ''
    });

    const savedSoftenerSpare = await softenerSpare.save();
    res.status(201).json(savedSoftenerSpare);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update softener spare
const updateSoftenerSpare = async (req, res) => {
  try {
    const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
    
    const softenerSpare = await SoftenerSpares.findByIdAndUpdate(
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

    if (!softenerSpare) {
      return res.status(404).json({ message: 'Softener spare not found' });
    }

    res.json(softenerSpare);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete softener spare
const deleteSoftenerSpare = async (req, res) => {
  try {
    const softenerSpare = await SoftenerSpares.findByIdAndDelete(req.params.id);
    
    if (!softenerSpare) {
      return res.status(404).json({ message: 'Softener spare not found' });
    }

    res.json({ message: 'Softener spare deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSoftenerSpares,
  getSoftenerSpare,
  createSoftenerSpare,
  updateSoftenerSpare,
  deleteSoftenerSpare
};