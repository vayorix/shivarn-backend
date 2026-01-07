const express = require('express');
const router = express.Router();
const controllers = require('../controllers/domesticRoController');

// RO Water Purifiers routes
router.get('/ro-water-purifiers', controllers.roWaterPurifiers.getAll);
router.get('/ro-water-purifiers/:id', controllers.roWaterPurifiers.getOne);
router.post('/ro-water-purifiers', controllers.roWaterPurifiers.create);
router.put('/ro-water-purifiers/:id', controllers.roWaterPurifiers.update);
router.delete('/ro-water-purifiers/:id', controllers.roWaterPurifiers.delete);

// RO Membrane routes
router.get('/ro-membrane', controllers.roMembrane.getAll);
router.get('/ro-membrane/:id', controllers.roMembrane.getOne);
router.post('/ro-membrane', controllers.roMembrane.create);
router.put('/ro-membrane/:id', controllers.roMembrane.update);
router.delete('/ro-membrane/:id', controllers.roMembrane.delete);

// Cartridge Filter routes
router.get('/cartridge-filter', controllers.cartridgeFilter.getAll);
router.get('/cartridge-filter/:id', controllers.cartridgeFilter.getOne);
router.post('/cartridge-filter', controllers.cartridgeFilter.create);
router.put('/cartridge-filter/:id', controllers.cartridgeFilter.update);
router.delete('/cartridge-filter/:id', controllers.cartridgeFilter.delete);

// Sediment Filter routes
router.get('/sediment-filter', controllers.sedimentFilter.getAll);
router.get('/sediment-filter/:id', controllers.sedimentFilter.getOne);
router.post('/sediment-filter', controllers.sedimentFilter.create);
router.put('/sediment-filter/:id', controllers.sedimentFilter.update);
router.delete('/sediment-filter/:id', controllers.sedimentFilter.delete);

// Domestic Carbon Filter routes
router.get('/domestic-carbon-filter', controllers.domesticCarbonFilter.getAll);
router.get('/domestic-carbon-filter/:id', controllers.domesticCarbonFilter.getOne);
router.post('/domestic-carbon-filter', controllers.domesticCarbonFilter.create);
router.put('/domestic-carbon-filter/:id', controllers.domesticCarbonFilter.update);
router.delete('/domestic-carbon-filter/:id', controllers.domesticCarbonFilter.delete);

// RO Filter Kit routes
router.get('/ro-filter-kit', controllers.roFilterKit.getAll);
router.get('/ro-filter-kit/:id', controllers.roFilterKit.getOne);
router.post('/ro-filter-kit', controllers.roFilterKit.create);
router.put('/ro-filter-kit/:id', controllers.roFilterKit.update);
router.delete('/ro-filter-kit/:id', controllers.roFilterKit.delete);

// Gravity Water Purifiers routes
router.get('/gravity-water-purifiers', controllers.gravityWaterPurifiers.getAll);
router.get('/gravity-water-purifiers/:id', controllers.gravityWaterPurifiers.getOne);
router.post('/gravity-water-purifiers', controllers.gravityWaterPurifiers.create);
router.put('/gravity-water-purifiers/:id', controllers.gravityWaterPurifiers.update);
router.delete('/gravity-water-purifiers/:id', controllers.gravityWaterPurifiers.delete);

// RO Service routes
router.get('/ro-service', controllers.roService.getAll);
router.get('/ro-service/:id', controllers.roService.getOne);
router.post('/ro-service', controllers.roService.create);
router.put('/ro-service/:id', controllers.roService.update);
router.delete('/ro-service/:id', controllers.roService.delete);

// Domestic Others routes
router.get('/domestic-others', controllers.domesticOthers.getAll);
router.get('/domestic-others/:id', controllers.domesticOthers.getOne);
router.post('/domestic-others', controllers.domesticOthers.create);
router.put('/domestic-others/:id', controllers.domesticOthers.update);
router.delete('/domestic-others/:id', controllers.domesticOthers.delete);

module.exports = router;