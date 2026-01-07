const express = require('express');
const router = express.Router();
const {
  getAllWaterSofteners,
  getWaterSoftener,
  createWaterSoftener,
  updateWaterSoftener,
  deleteWaterSoftener
} = require('../controllers/waterSoftenerController');

router.get('/', getAllWaterSofteners);
router.get('/:id', getWaterSoftener);
router.post('/', createWaterSoftener);
router.put('/:id', updateWaterSoftener);
router.delete('/:id', deleteWaterSoftener);

module.exports = router;