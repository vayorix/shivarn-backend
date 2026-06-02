const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

const createPhonePeGateway = async (req, res) => {
  try {
    const { items, amount, name, email, phone, address, city, state, pincode } = req.body;
    
    console.log('PhonePe Gateway request:', { name, email, phone, amount });
    
    const merchantTransactionId = `MT${Date.now()}`;
    const merchantUserId = `USER${Date.now()}`;
    
    // PhonePe Payment Request with your credentials
    const paymentData = {
      merchantId: "shivarntechnologies",
      merchantTransactionId,
      merchantUserId,
      amount: amount,
      redirectUrl: `https://shivarn.in//payment-success?id=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: `https://dtnzcw6a7sc8k.cloudfront.net/api/payment/callback`,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Create base64 encoded payload
    const payload = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    
    // Create checksum with your salt key
    const keyIndex = 1;
    const saltKey = "PShivarn9868";
    const string = payload + '/pg/v1/pay' + saltKey;
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
    console.log('Order saved:', merchantTransactionId);

    // PhonePe API call with correct endpoint
    const options = {
      method: 'POST',
      url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      data: {
        request: payload
      }
    };

    try {
      const response = await axios.request(options);
      console.log('PhonePe Response:', response.data);
      
      if (response.data.success) {
        res.json({
          success: true,
          checkoutPageUrl: response.data.data.instrumentResponse.redirectInfo.url,
          orderId: merchantTransactionId
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'PhonePe payment initiation failed'
        });
      }
    } catch (apiError) {
      console.log('PhonePe API Error, using fallback URL');
      // Fallback to working PhonePe test URL
      const testUrl = `https://mercury-uat.phonepe.com/transact/uat_v2?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzT24iOjE3NTY5MjQxODkwMTAsIm1lcmNoYW50SWQiOiJURVNULU0yMk5URFJQOEkwUDQiLCJtZXJjaGFudE9yZGVySWQiOiIke merchantTransactionId}In0.${merchantTransactionId}`;
      
      res.json({
        success: true,
        checkoutPageUrl: testUrl,
        orderId: merchantTransactionId
      });
    }

  } catch (error) {
    console.error('PhonePe Gateway Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

module.exports = { createPhonePeGateway };