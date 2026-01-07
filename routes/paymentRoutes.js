const express = require('express');
const { createProperPhonePePayment } = require('../controllers/properPhonePeController');
const { handlePaymentSuccess } = require('../controllers/inquiryController');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/create-checkout-session', createProperPhonePePayment);
router.get('/payment-success', handlePaymentSuccess);

// Test route to manually update order status
router.get('/test-update/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('🧪 Test update for order:', orderId);
    
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { paymentStatus: 'completed' },
      { new: true }
    );
    
    if (order) {
      res.json({ success: true, message: 'Updated successfully', order });
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Test email route
router.get('/test-email', async (req, res) => {
  try {
    const { handlePaymentSuccess } = require('../controllers/inquiryController');
    const createTransporter = require('../config/email');
    const transporter = createTransporter();
    
    console.log('📧 Testing email system...');
    
    const result = await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: process.env.MAIL_FROM_ADDRESS,
      subject: 'Test Email - Shivarn Technologies',
      html: '<h1>Test Email</h1><p>If you receive this, email system is working!</p>'
    });
    
    console.log('✅ Test email sent:', result.messageId);
    res.json({ success: true, message: 'Test email sent successfully', messageId: result.messageId });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;