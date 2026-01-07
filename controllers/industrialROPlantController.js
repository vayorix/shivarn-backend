const IndustrialROPlant = require('../models/IndustrialROPlant');

// Get all industrial RO plants with pagination
const getIndustrialROPlants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPlants = await IndustrialROPlant.countDocuments();
    const plants = await IndustrialROPlant.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      plants,
      currentPage: page,
      totalPages: Math.ceil(totalPlants / limit),
      totalPlants
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new industrial RO plant
const createIndustrialROPlant = async (req, res) => {
  try {
    const plant = new IndustrialROPlant(req.body);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update industrial RO plant
const updateIndustrialROPlant = async (req, res) => {
  try {
    const plant = await IndustrialROPlant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete industrial RO plant
const deleteIndustrialROPlant = async (req, res) => {
  try {
    const plant = await IndustrialROPlant.findByIdAndDelete(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIndustrialROPlants,
  createIndustrialROPlant,
  updateIndustrialROPlant,
  deleteIndustrialROPlant
};