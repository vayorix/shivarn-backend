const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Import all product models
const WaterSoftener = require('../models/WaterSoftener');
const SoftenerSpares = require('../models/SoftenerSpares');
const RoWaterPurifiers = require('../models/RoWaterPurifiers');
const RoMembrane = require('../models/RoMembrane');
const CartridgeFilter = require('../models/CartridgeFilter');
const SedimentFilter = require('../models/SedimentFilter');
const DomesticCarbonFilter = require('../models/DomesticCarbonFilter');
const RoFilterKit = require('../models/RoFilterKit');
const GravityWaterPurifiers = require('../models/GravityWaterPurifiers');
const RoService = require('../models/RoService');
const DomesticOthers = require('../models/DomesticOthers');
const IndustrialROPlant = require('../models/IndustrialROPlant');
const IndustrialROSpares = require('../models/IndustrialROSpares');
const RospareCartridgeFilter = require('../models/RospareCartridgeFilter');
const MultiportValve = require('../models/MultiportValve');
const Chemicals = require('../models/Chemicals');
const CartridgeFilterHousing = require('../models/CartridgeFilterHousing');
const OthersSpares = require('../models/OthersSpares');
const AccessorySandFilter = require('../models/AccessorySandFilter');
const AccessoryCarbonFilter = require('../models/AccessoryCarbonFilter');
const Pumps = require('../models/Pumps');
const FRPVessels = require('../models/FRPVessels');
const DowRoMembrane = require('../models/DowRoMembrane');
const TorayRoMembrane = require('../models/TorayRoMembrane');
const HMRoMembrane = require('../models/HMRoMembrane');
const UltraRoMembrane = require('../models/UltraRoMembrane');
const IndustrialMembraneHousing = require('../models/IndustrialMembraneHousing');
const LGMembrane = require('../models/LGMembrane');
const GreaseTrapPlant = require('../models/GreaseTrapPlant');
const ETPPlants = require('../models/ETPPlants');
const STPPlants = require('../models/STPPlants');
const STPSpares = require('../models/STPSpares');

const getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();
    
    // Count total orders
    const totalOrders = await Order.countDocuments();
    
    // Count total products across all categories
    const productCounts = await Promise.all([
      Product.countDocuments(),
      WaterSoftener.countDocuments(),
      SoftenerSpares.countDocuments(),
      RoWaterPurifiers.countDocuments(),
      RoMembrane.countDocuments(),
      CartridgeFilter.countDocuments(),
      SedimentFilter.countDocuments(),
      DomesticCarbonFilter.countDocuments(),
      RoFilterKit.countDocuments(),
      GravityWaterPurifiers.countDocuments(),
      RoService.countDocuments(),
      DomesticOthers.countDocuments(),
      IndustrialROPlant.countDocuments(),
      IndustrialROSpares.countDocuments(),
      RospareCartridgeFilter.countDocuments(),
      MultiportValve.countDocuments(),
      Chemicals.countDocuments(),
      CartridgeFilterHousing.countDocuments(),
      OthersSpares.countDocuments(),
      AccessorySandFilter.countDocuments(),
      AccessoryCarbonFilter.countDocuments(),
      Pumps.countDocuments(),
      FRPVessels.countDocuments(),
      DowRoMembrane.countDocuments(),
      TorayRoMembrane.countDocuments(),
      HMRoMembrane.countDocuments(),
      UltraRoMembrane.countDocuments(),
      IndustrialMembraneHousing.countDocuments(),
      LGMembrane.countDocuments(),
      GreaseTrapPlant.countDocuments(),
      ETPPlants.countDocuments(),
      STPPlants.countDocuments(),
      STPSpares.countDocuments()
    ]);
    
    const totalProducts = productCounts.reduce((sum, count) => sum + count, 0);
    
    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId name email totalAmount paymentStatus createdAt');

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };