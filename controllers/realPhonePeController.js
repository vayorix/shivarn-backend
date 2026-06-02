const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

const createPhonePePayment = async (req, res) => {
  try {
    const { items, amount, name, email, phone, address, city, state, pincode } = req.body;
    
    const merchantTransactionId = `MT${Date.now()}`;
    const merchantUserId = `USER${Date.now()}`;
    
    // PhonePe Payment Request
    const paymentData = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: amount, // Amount in paise
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URL || 'https://shivarn.in//payment-success'}?id=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: process.env.PHONEPE_CALLBACK_URL,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Create base64 encoded payload
    const payload = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    
    // Create checksum
    const keyIndex = process.env.PHONEPE_SALT_INDEX;
    const string = payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    // Save order to database
    const order = new Order({
      userId: null,
      orderId: merchantTransactionId,
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
      paymentMethod: 'phonepe',
      paymentStatus: 'pending'
    });

    await order.save();

    // PhonePe API call
    const options = {
      method: 'POST',
      url: `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      data: {
        request: payload
      }
    };

    const response = await axios.request(options);
    
    if (response.data.success) {
      res.json({
        success: true,
        checkoutPageUrl: response.data.data.instrumentResponse.redirectInfo.url,
        orderId: merchantTransactionId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment initiation failed'
      });
    }

  } catch (error) {
    console.error('PhonePe Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { response } = req.body;
    
    const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedResponse);
    
    // Update order status
    const order = await Order.findOneAndUpdate(
      { orderId: responseData.data.merchantTransactionId },
      { 
        paymentStatus: responseData.success ? 'success' : 'failed',
        transactionId: responseData.data.transactionId
      },
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ success: false });
  }
};

module.exports = { createPhonePePayment, handleCallback };