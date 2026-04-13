const RoWaterPurifiers = require('../models/RoWaterPurifiers');
const RoMembrane = require('../models/RoMembrane');
const CartridgeFilter = require('../models/CartridgeFilter');
const SedimentFilter = require('../models/SedimentFilter');
const DomesticCarbonFilter = require('../models/DomesticCarbonFilter');
const RoFilterKit = require('../models/RoFilterKit');
const GravityWaterPurifiers = require('../models/GravityWaterPurifiers');
const RoService = require('../models/RoService');
const DomesticOthers = require('../models/DomesticOthers');

// Generic controller factory
const createController = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json({ items, total: items.length });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: `${modelName} not found` });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
      const item = new Model({ 
        title, 
        price, 
        image, 
        gst, 
        shippingCharges, 
        specifications: specifications || [], 
        stockStatus: stockStatus || 'In Stock',
        hsnSacCode: hsnSacCode || ''
      });
      const savedItem = await item.save();
      res.status(201).json(savedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { title, price, image, gst, shippingCharges, specifications, stockStatus, hsnSacCode } = req.body;
      const item = await Model.findByIdAndUpdate(
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

      if (!item) {
        return res.status(404).json({ message: `${modelName} not found` });
      }

      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ message: `${modelName} not found` });
      }
      res.json({ message: `${modelName} deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Export controllers for each model
module.exports = {
  roWaterPurifiers: createController(RoWaterPurifiers, 'RO Water Purifier'),
  roMembrane: createController(RoMembrane, 'RO Membrane'),
  cartridgeFilter: createController(CartridgeFilter, 'Cartridge Filter'),
  sedimentFilter: createController(SedimentFilter, 'Sediment Filter'),
  domesticCarbonFilter: createController(DomesticCarbonFilter, 'Domestic Carbon Filter'),
  roFilterKit: createController(RoFilterKit, 'RO Filter Kit'),
  gravityWaterPurifiers: createController(GravityWaterPurifiers, 'Gravity Water Purifier'),
  roService: createController(RoService, 'RO Service'),
  domesticOthers: createController(DomesticOthers, 'Domestic Others')
};