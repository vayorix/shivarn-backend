const Pumps = require('../models/Pumps');

const getPumps = async (req, res) => {
  try {
    const pumps = await Pumps.find().sort({ createdAt: -1 });
    res.json({ pumps, totalPumps: pumps.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPump = async (req, res) => {
  try {
    const pump = new Pumps(req.body);
    const savedPump = await pump.save();
    res.status(201).json(savedPump);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePump = async (req, res) => {
  try {
    const pump = await Pumps.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    res.json(pump);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePump = async (req, res) => {
  try {
    const pump = await Pumps.findByIdAndDelete(req.params.id);
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    res.json({ message: 'Pump deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPumps,
  createPump,
  updatePump,
  deletePump
};