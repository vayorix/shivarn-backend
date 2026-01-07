const express = require('express');
const router = express.Router();
const {
  getAllSoftenerSpares,
  getSoftenerSpare,
  createSoftenerSpare,
  updateSoftenerSpare,
  deleteSoftenerSpare
} = require('../controllers/softenerSparesController');

router.get('/', getAllSoftenerSpares);
router.get('/:id', getSoftenerSpare);
router.post('/', createSoftenerSpare);
router.put('/:id', updateSoftenerSpare);
router.delete('/:id', deleteSoftenerSpare);

module.exports = router;