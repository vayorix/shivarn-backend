const FRPVessels = require('../models/FRPVessels');

const getFRPVessels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalVessels = await FRPVessels.countDocuments();
    const vessels = await FRPVessels.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      vessels,
      currentPage: page,
      totalPages: Math.ceil(totalVessels / limit),
      totalVessels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFRPVessel = async (req, res) => {
  try {
    const vessel = new FRPVessels(req.body);
    const savedVessel = await vessel.save();
    res.status(201).json(savedVessel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFRPVessel = async (req, res) => {
  try {
    const vessel = await FRPVessels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    res.json(vessel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFRPVessel = async (req, res) => {
  try {
    const vessel = await FRPVessels.findByIdAndDelete(req.params.id);
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    res.json({ message: 'Vessel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFRPVessels,
  createFRPVessel,
  updateFRPVessel,
  deleteFRPVessel
};