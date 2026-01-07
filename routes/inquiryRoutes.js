const express = require('express');
const { sendInquiry } = require('../controllers/inquiryController');
const { subscribeNewsletter } = require('../controllers/newsletterController');

const router = express.Router();

router.post('/inquiry', sendInquiry);
router.post('/newsletter-subscribe', subscribeNewsletter);

module.exports = router;