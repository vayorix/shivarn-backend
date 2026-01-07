const express = require('express');
const router = express.Router();
const {
  getIndustrialROPlants,
  createIndustrialROPlant,
  updateIndustrialROPlant,
  deleteIndustrialROPlant
} = require('../controllers/industrialROPlantController');

router.get('/', getIndustrialROPlants);
router.post('/', createIndustrialROPlant);
router.put('/:id', updateIndustrialROPlant);
router.delete('/:id', deleteIndustrialROPlant);

module.exports = router;