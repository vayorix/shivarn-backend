const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('pg-sdk-node');
const { randomUUID } = require('crypto');
const Order = require('../models/Order');

// PhonePe Configuration
const clientId = process.env.PHONEPE_CLIENT_ID || "SU2604171224483256279711";
const clientSecret = process.env.PHONEPE_CLIENT_SECRET || "b017d1c0-2b6f-497c-9d31-c6317afd262e";
const clientVersion = 1;
const env = Env.SANDBOX;

if (!clientId || !clientSecret) {
  console.error('Error: PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET is not defined in .env');
  throw new Error('PhonePe configuration missing');
}

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

const createCheckoutSession = async (req, res) => {
  try {
    const { items, amount, name, email, phone, address, city, state, pincode } = req.body;

    if (!items || !amount || !name || !email || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    console.log('Received Payload:', req.body);

    const merchantOrderId = randomUUID();
    const redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'https://shivarn.in//payment-success';

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    console.log('PhonePe Request:', request);

    const response = await client.pay(request);
    console.log('PhonePe Response:', response);

    if (!response || !response.redirectUrl) {
      throw new Error('Checkout URL not received from PhonePe API');
    }

    const checkoutPageUrl = response.redirectUrl;

    const order = new Order({
      userId: req.user?.id,
      name,
      email,
      phone,
      streetAddress: address,
      townCity: city,
      state,
      postcode: pincode,
      country: 'India',
      totalAmount: amount / 100,
      paymentMethod: 'phonepe',
      paymentStatus: 'pending',
      cartItems: items,
      transactionId: merchantOrderId,
      orderId: response.orderId || merchantOrderId,
    });

    const savedOrder = await order.save();
    console.log('Saved Order:', savedOrder);

    res.status(200).json({ checkoutPageUrl, orderId: savedOrder._id });
  } catch (error) {
    console.error('PhonePe Payment Error:', error);
    res.status(500).json({ message: 'Error in payment processing', error: error.message });
  }
};

const handleCallback = async (req, res) => {
  try {
    console.log('Callback Received at:', new Date().toISOString());
    console.log('Callback Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Callback Body:', JSON.stringify(req.body, null, 2));

    const authorizationHeader = req.headers['authorization'];
    const responseBody = JSON.stringify(req.body);
    const username = process.env.PHONEPE_MERCHANT_USERNAME || 'shivarntechnologies';
    const password = process.env.PHONEPE_MERCHANT_PASSWORD || 'PShivarn9868';

    if (!username || !password) {
      console.error('Missing credentials in .env');
      throw new Error('PHONEPE_MERCHANT_USERNAME or PHONEPE_MERCHANT_PASSWORD is not defined');
    }

    const callbackResponse = client.validateCallback(
      username,
      password,
      authorizationHeader,
      responseBody
    );

    console.log('Callback Response:', JSON.stringify(callbackResponse, null, 2));

    if (!callbackResponse.payload || !callbackResponse.payload.orderId || !callbackResponse.payload.state) {
      console.error('Invalid callback payload:', callbackResponse);
      return res.status(400).json({ message: 'Invalid callback payload' });
    }

    const { orderId, state } = callbackResponse.payload;

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: state === 'COMPLETED' || state === 'PAYMENT_SUCCESS' ? 'success' : 'failed',
      },
      { new: true }
    );

    if (!order) {
      console.error('Order not found for orderId:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order Updated:', order);
    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Callback Error:', error.message, error.stack);
    res.status(500).json({ message: 'Error in callback processing', error: error.message });
  }
};

const handleRedirect = async (req, res) => {
  try {
    console.log('Redirect Received:', req.query);
    const { transactionId, code } = req.query;

    const order = await Order.findOne({ transactionId });

    if (!order) {
      console.error('Order not found for transactionId:', transactionId);
      return res.status(404).send('Order not found');
    }

    const isPaymentSuccessful = (code === 'PAYMENT_SUCCESS');

    if (isPaymentSuccessful) {
      res.send('<h1>Payment Successful! Thank you for your purchase.</h1>');
    } else {
      res.send('<h1>Payment Failed or Pending. Please try again.</h1>');
    }
  } catch (error) {
    console.error('Redirect Error:', error);
    res.status(500).send('Error processing redirect');
  }
};

module.exports = { createCheckoutSession, handleCallback, handleRedirect };