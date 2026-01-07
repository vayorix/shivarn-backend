const createTransporter = require('../config/email');

const transporter = createTransporter();

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid email address is required' 
      });
    }

    console.log('📧 Newsletter subscription request for:', email);

    // Send confirmation email to subscriber
    const subscriberEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter Subscription Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Shivarn Technologies!</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Newsletter Subscription Confirmed</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0;">Thank you for subscribing!</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                      You have successfully subscribed to the Shivarn Technologies newsletter. You'll now receive:
                    </p>
                    
                    <ul style="color: #666; font-size: 16px; line-height: 1.8;">
                      <li>Latest product updates and launches</li>
                      <li>Special offers and discounts</li>
                      <li>Water treatment tips and insights</li>
                      <li>Industry news and trends</li>
                    </ul>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #667eea; margin: 0 0 10px 0;">📧 Subscription Details</h3>
                      <p style="margin: 0; color: #666;">Email: ${email}</p>
                      <p style="margin: 5px 0 0 0; color: #666;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background: #f8f9fa;">
                    <h3 style="color: #667eea; margin: 0 0 10px 0;">Shivarn Technologies 💧</h3>
                    <p style="color: #666; margin: 0 0 20px 0;">Leading Water Treatment Solutions</p>
                    
                    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <h4 style="color: #333; margin: 0 0 10px 0;">📞 Contact Us</h4>
                      <p style="margin: 5px 0; color: #666;">Phone: (+91) 99780 70593</p>
                      <p style="margin: 5px 0; color: #666;">Email: info@shivarn.in</p>
                    </div>
                    
                    <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                      You can unsubscribe at any time by contacting us.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745;">📧 New Newsletter Subscription!</h1>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Subscriber Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN')}</p>
        </div>
        <p>A new user has subscribed to the Shivarn Technologies newsletter.</p>
      </div>
    `;

    // Send confirmation email to subscriber
    await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: email,
      subject: 'Welcome to Shivarn Technologies Newsletter! 🎉',
      html: subscriberEmailHtml,
    });

    // Send notification to admin
    await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: process.env.MAIL_FROM_ADDRESS,
      subject: `📧 New Newsletter Subscription - ${email}`,
      html: adminEmailHtml,
    });

    console.log('✅ Newsletter subscription emails sent successfully');

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.',
      error: error.message
    });
  }
};

module.exports = { subscribeNewsletter };