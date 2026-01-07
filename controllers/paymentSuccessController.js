const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const handlePaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID required' });
    }

    // Update order status to completed
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('Order updated to completed:', orderId);

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Successful! 🎉</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Dear ${order.name},</h2>
          
          <p style="font-size: 16px; color: #666;">
            Thank you for your order! Your payment has been successfully processed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
            <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">COMPLETED</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Delivery Address</h3>
            <p>${order.streetAddress}<br>
            ${order.townCity}, ${order.state} - ${order.postcode}<br>
            ${order.country}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Ordered Items</h3>
            ${order.cartItems.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p style="margin: 5px 0;"><strong>${item.title || item.name}</strong></p>
                <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity} × ₹${item.price.toLocaleString()}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">We will process your order and contact you soon for delivery details.</p>
            <p style="color: #667eea; font-weight: bold;">Thank you for choosing Shivarn Technologies!</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">For any queries, contact us at:</p>
          <p style="margin: 5px 0;">📞 (+91) 99780 70593</p>
          <p style="margin: 5px 0;">📧 viveklpatel1410@gmail.com</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: order.email,
      subject: `Order Confirmation - ${order.orderId} | Shivarn Technologies`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', order.email);

    res.json({
      success: true,
      message: 'Payment confirmed and email sent',
      orderId: order.orderId
    });

  } catch (error) {
    console.error('Payment success handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment success',
      error: error.message
    });
  }
};

module.exports = { handlePaymentSuccess };