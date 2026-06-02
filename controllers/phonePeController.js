const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

const createPayment = async (req, res) => {
  try {
    const { billingDetails, cartItems, total } = req.body;
    
    const merchantTransactionId = `MT${Date.now()}`;
    const merchantUserId = `USER${req.user?.id || Date.now()}`;
    
    const paymentData = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: total * 100, // Convert to paise
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
      userId: req.user?.id,
      orderId: merchantTransactionId,
      name: billingDetails.name,
      email: billingDetails.email,
      phone: billingDetails.phone,
      streetAddress: billingDetails.streetAddress,
      townCity: billingDetails.townCity,
      state: billingDetails.state,
      postcode: billingDetails.postcode,
      country: billingDetails.country || 'India',
      cartItems,
      totalAmount: total,
      paymentMethod: 'phonepe',
      paymentStatus: 'pending'
    });

    await order.save();

    // Make API call to PhonePe
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
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId
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
    
    // Decode the response
    const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedResponse);
    
    // Verify checksum
    const receivedChecksum = req.headers['x-verify'];
    const keyIndex = process.env.PHONEPE_SALT_INDEX;
    const string = response + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const expectedChecksum = sha256 + '###' + keyIndex;
    
    if (receivedChecksum !== expectedChecksum) {
      return res.status(400).json({ success: false, message: 'Invalid checksum' });
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
      { orderId: responseData.data.merchantTransactionId },
      { 
        paymentStatus: responseData.success ? 'success' : 'failed',
        transactionId: responseData.data.transactionId
      },
      { new: true }
    );

    if (order) {
      console.log('Order updated:', order);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({ success: false, message: 'Callback processing failed' });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    
    // Create checksum for status check
    const keyIndex = process.env.PHONEPE_SALT_INDEX;
    const string = `/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const options = {
      method: 'GET',
      url: `${process.env.PHONEPE_BASE_URL}/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
      }
    };

    const response = await axios.request(options);
    
    if (response.data.success) {
      // Update order status based on response
      const order = await Order.findOneAndUpdate(
        { orderId: merchantTransactionId },
        { 
          paymentStatus: response.data.data.state === 'COMPLETED' ? 'success' : 'failed'
        },
        { new: true }
      );

      res.json({
        success: true,
        paymentStatus: response.data.data.state,
        order
      });
    } else {
      res.json({
        success: false,
        message: 'Payment status check failed'
      });
    }

  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error.message
    });
  }
};

module.exports = { createPayment, handleCallback, checkPaymentStatus };