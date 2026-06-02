const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('pg-sdk-node');
const { randomUUID } = require('crypto');
const Order = require('../models/Order');



// PhonePe Configuration
const clientId = process.env.PHONEPE_CLIENT_ID || "SU2604171224483256279711";
const clientSecret = process.env.PHONEPE_CLIENT_SECRET || "b017d1c0-2b6f-497c-9d31-c6317afd262e";
const clientVersion = 1;
const env = Env.PRODUCTION;

if (!clientId || !clientSecret) {
  console.error('Error: PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET is not defined');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('PHONEPE')));
}

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

const createProperPhonePePayment = async (req, res) => {
  try {
    const { 
      items, 
      amount, 
      billingDetails, 
      shippingDetails, 
      activeForm,
      name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      pincode, 
      userId 
    } = req.body;
    
    // Use billing details as primary, fallback to legacy format
    const customerName = billingDetails?.name || shippingDetails?.name || name;
    const customerEmail = billingDetails?.email || email; // Email only in billing
    const customerPhone = billingDetails?.phone || shippingDetails?.phone || phone;
    const customerAddress = billingDetails?.streetAddress || shippingDetails?.streetAddress || address;
    const customerCity = billingDetails?.townCity || shippingDetails?.townCity || city;
    const customerState = billingDetails?.state || shippingDetails?.state || state;
    const customerPincode = billingDetails?.postcode || shippingDetails?.postcode || pincode;
    
    console.log('PhonePe SDK request:', { 
      customerName, 
      customerEmail, 
      customerPhone, 
      amount, 
      userId,
      activeForm,
      billingDetails,
      shippingDetails,
      items: JSON.stringify(items, null, 2)
    });
    
    // Use default values if fields are missing
    const finalName = customerName || 'Customer';
    const finalPhone = customerPhone || '0000000000';
    const finalEmail = customerEmail || 'noemail@example.com';
    const finalAmount = amount || 100;
    
    const merchantOrderId = randomUUID();
    const redirectUrl = `${process.env.PHONEPE_REDIRECT_URL || 'https://shivarn.in//payment-success'}?orderId=${merchantOrderId}`;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(finalAmount)
      .redirectUrl(redirectUrl)
      .build();

    console.log('PhonePe Request:', request);

    // Save order to database
    const order = new Order({
      userId: userId || null,
      orderId: merchantOrderId,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      streetAddress: customerAddress,
      townCity: customerCity,
      state: customerState,
      postcode: customerPincode,
      country: 'India',
      billingDetails: billingDetails || null,
      shippingDetails: shippingDetails || null,
      cartItems: items,
      totalAmount: amount / 100,
      paymentMethod: 'phonepe',
      paymentStatus: 'pending'
    });

    await order.save();
    console.log('Order saved:', merchantOrderId);

    const response = await client.pay(request);
    console.log('PhonePe Response:', response);

    if (!response || !response.redirectUrl) {
      throw new Error('Checkout URL not received from PhonePe API');
    }

    res.json({
      success: true,
      checkoutPageUrl: response.redirectUrl,
      orderId: merchantOrderId
    });

  } catch (error) {
    console.error('PhonePe Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

module.exports = { createProperPhonePePayment };