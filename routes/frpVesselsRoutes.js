const express = require('express');
const router = express.Router();
const {
  getFRPVessels,
  createFRPVessel,
  updateFRPVessel,
  deleteFRPVessel
} = require('../controllers/frpVesselsController');

router.get('/', getFRPVessels);
router.post('/', createFRPVessel);
router.put('/:id', updateFRPVessel);
router.delete('/:id', deleteFRPVessel);

module.exports = router;