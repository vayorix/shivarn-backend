const Order = require('../models/Order');

const createUPIPayment = async (req, res) => {
  try {
    const { items, amount, name, email, phone, address, city, state, pincode } = req.body;
    
    console.log('UPI Payment request:', { name, email, phone, amount });
    
    const orderId = `WP${Date.now()}`;
    
    // Save order to database
    const order = new Order({
      userId: null,
      orderId,
      name,
      email,
      phone,
      streetAddress: address,
      townCity: city,
      state,
      postcode: pincode,
      country: 'India',
      cartItems: items,
      totalAmount: amount / 100,
      paymentMethod: 'upi',
      paymentStatus: 'pending'
    });

    await order.save();
    console.log('Order saved successfully:', orderId);

    // Create UPI payment URL
    const upiId = "7990308097@ybl";
    const merchantName = "Shivarn Technologies";
    const upiAmount = amount / 100;
    
    // UPI deep link
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}&tr=${orderId}`;
    
    // PhonePe web URL
    const phonePeWebUrl = `https://phon.pe/ru_${orderId}`;
    
    // GPay web URL
    const gPayWebUrl = `https://pay.google.com/gp/p/ui/pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
    
    res.json({
      success: true,
      checkoutPageUrl: phonePeWebUrl, // Default to PhonePe web
      upiUrl,
      gPayUrl: gPayWebUrl,
      qrData: upiUrl,
      orderId,
      paymentDetails: {
        upiId,
        amount: upiAmount,
        orderNote: `Order ${orderId}`
      },
      message: 'Payment options generated successfully'
    });

  } catch (error) {
    console.error('UPI Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

module.exports = { createUPIPayment };