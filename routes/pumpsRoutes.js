const express = require('express');
const router = express.Router();
const {
  getPumps,
  createPump,
  updatePump,
  deletePump
} = require('../controllers/pumpsController');

router.get('/', getPumps);
router.post('/', createPump);
router.put('/:id', updatePump);
router.delete('/:id', deletePump);

module.exports = router;