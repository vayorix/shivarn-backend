const createTransporter = require('../config/email');
const Order = require('../models/Order');

const transporter = createTransporter();

const sendInquiry = async (req, res) => {
  try {
    const { fullName, mobile, email, message } = req.body;

    if (!fullName || !mobile || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: process.env.MAIL_FROM_ADDRESS,
      subject: 'New Inquiry from Water Plant Website',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00b7ff; border-bottom: 2px solid #00b7ff; padding-bottom: 10px;">
            New Inquiry Received
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Full Name:</td>
                <td style="padding: 8px 0; color: #333;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Mobile Number:</td>
                <td style="padding: 8px 0; color: #333;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="color: #555; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 5px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Note:</strong> This inquiry was submitted through the Water Plant website inquiry form.
              Please respond to the customer at their provided email address: ${email}
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Inquiry sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send inquiry. Please try again.' 
    });
  }
};

const handlePaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.query;
    console.log('🔥 Payment Success API called');
    console.log('📋 Query params:', req.query);
    console.log('🆔 Order ID received:', orderId);
    
    if (!orderId) {
      console.log('❌ No Order ID provided');
      return res.status(400).json({ success: false, message: 'Order ID required' });
    }

    // First check if order exists
    const existingOrder = await Order.findOne({ orderId: orderId });
    console.log('🔍 Searching for order:', orderId);
    console.log('📦 Order found:', existingOrder ? 'YES' : 'NO');
    
    if (!existingOrder) {
      console.log('❌ Order not found in database');
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('📊 Current payment status:', existingOrder.paymentStatus);

    // Update order status to completed
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('✅ Order updated to COMPLETED:', orderId);

    // Send confirmation emails
    try {
      console.log('📧 Attempting to send emails...');
      console.log('📧 Customer email:', order.email);
      console.log('📧 Admin email:', process.env.MAIL_FROM_ADDRESS);
      
      // Customer email
      const customerEmailResult = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: order.email,
        subject: `Order Confirmation - ${order.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #28a745;">🎉 Payment Successful!</h1>
            <p>Dear ${order.name},</p>
            <p>Your order has been confirmed successfully!</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: #28a745;">COMPLETED</span></p>
            </div>
            <p>Thank you for choosing Shivarn Technologies!</p>
            <p>Contact: (+91) 99780 70593</p>
          </div>
        `,
      });
      console.log('✅ Customer email sent:', customerEmailResult.messageId);

      // Admin email
      const adminEmailResult = await transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS,
        to: process.env.MAIL_FROM_ADDRESS,
        subject: `🎉 New Order Received - ${order.orderId} | ₹${order.totalAmount.toLocaleString()}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Order Alert</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 30px 0;">
              <tr>
                <td align="center">
                  <table width="650" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0056b3 0%, #00b7ff 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="80" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="40" cy="60" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); opacity: 0.3;"></div>
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 1;">🎉 New Order Alert!</h1>
                        <p style="color: white; margin: 15px 0 0 0; font-size: 18px; opacity: 0.95; position: relative; z-index: 1;">Shivarn Technologies</p>
                        <div style="background: rgba(255,255,255,0.2); border-radius: 25px; padding: 8px 20px; margin: 20px auto 0; display: inline-block; position: relative; z-index: 1;">
                          <span style="color: white; font-weight: 600; font-size: 16px;">Order #${order.orderId}</span>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                      <td style="padding: 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background: linear-gradient(90deg, #28a745, #20c997); padding: 25px 30px; text-align: center;">
                              <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">₹${order.totalAmount.toLocaleString()}</h2>
                              <p style="color: white; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Total Order Value</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Customer Information -->
                    <tr>
                      <td style="padding: 35px 30px;">
                        <h3 style="color: #2c3e50; margin: 0 0 25px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">👤 Customer Information</h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; overflow: hidden;">
                          <tr>
                            <td style="padding: 20px; border-bottom: 1px solid #e9ecef;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="30%" style="padding: 8px 0; font-weight: 600; color: #495057;">👤 Name:</td>
                                  <td style="padding: 8px 0; color: #212529; font-weight: 500;">${order.name}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #495057;">📧 Email:</td>
                                  <td style="padding: 8px 0; color: #007bff; font-weight: 500;">
                                    <a href="mailto:${order.email}" style="color: #007bff; text-decoration: none;">${order.email}</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; font-weight: 600; color: #495057;">📞 Phone:</td>
                                  <td style="padding: 8px 0; color: #28a745; font-weight: 500;">
                                    <a href="tel:${order.phone}" style="color: #28a745; text-decoration: none;">${order.phone}</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Shipping Address -->
                    <tr>
                      <td style="padding: 0 30px 35px;">
                        <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">🏠 Shipping Address</h3>
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
                          <p style="margin: 0; color: #495057; line-height: 1.6; font-size: 15px;">
                            <strong>${order.streetAddress}</strong><br>
                            ${order.townCity}, ${order.state} - ${order.postcode}<br>
                            ${order.country || 'India'}
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Order Details -->
                    <tr>
                      <td style="padding: 0 30px 35px;">
                        <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📦 Order Details</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
                          <tr style="background: #f8f9fa;">
                            <td style="padding: 15px 20px; font-weight: 600; color: #495057; border-bottom: 1px solid #dee2e6;">Order ID</td>
                            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #dee2e6; font-family: monospace;">${order.orderId}</td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 20px; font-weight: 600; color: #495057; border-bottom: 1px solid #dee2e6;">Order Date</td>
                            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #dee2e6;">${new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</td>
                          </tr>
                          <tr style="background: #f8f9fa;">
                            <td style="padding: 15px 20px; font-weight: 600; color: #495057; border-bottom: 1px solid #dee2e6;">Payment Status</td>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #dee2e6;">
                              <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✅ COMPLETED</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 20px; font-weight: 600; color: #495057;">Total Amount</td>
                            <td style="padding: 15px 20px; color: #28a745; font-weight: 700; font-size: 18px;">₹${order.totalAmount.toLocaleString()}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Action Required -->
                    <tr>
                      <td style="padding: 0 30px 35px;">
                        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px;">
                          <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚡ Action Required</h4>
                          <p style="color: #856404; margin: 0; line-height: 1.5;">Please process this order and contact the customer for delivery arrangements.</p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #2c3e50; padding: 30px; text-align: center;">
                        <h3 style="color: #ecf0f1; margin: 0 0 15px 0; font-size: 18px;">💧 Shivarn Technologies</h3>
                        <p style="color: #bdc3c7; margin: 0 0 20px 0; font-size: 14px;">Leading Water Treatment Solutions</p>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align: center;">
                              <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin: 0 auto; display: inline-block;">
                                <p style="color: #ecf0f1; margin: 0; font-size: 14px;">📞 (+91) 99780 70593 | 📧 info@shivarn.in</p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #95a5a6; font-size: 12px; margin: 20px 0 0 0; line-height: 1.4;">
                          This is an automated notification from your e-commerce system.<br>
                          Generated on ${new Date().toLocaleString('en-IN')}
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      console.log('✅ Admin email sent:', adminEmailResult.messageId);
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      console.error('❌ Full error:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment status updated to completed',
      orderId: order.orderId
    });

  } catch (error) {
    console.error('❌ Payment success handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment success',
      error: error.message
    });
  }
};

module.exports = { sendInquiry, handlePaymentSuccess };