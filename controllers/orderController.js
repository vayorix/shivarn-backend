const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { email, userId } = req.query;
    
    // Use $or query to match either email or userId
    let query = { $or: [] };
    
    if (email) {
      query.$or.push({ email: email });
    }
    if (userId) {
      query.$or.push({ userId: userId });
    }
    
    // If no search criteria, return empty
    if (query.$or.length === 0) {
      return res.json({ success: true, orders: [] });
    }
    
    console.log('🔍 Searching orders with query:', JSON.stringify(query, null, 2));
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log('📦 Found orders:', orders.length);
    
    // Also try to find all orders to debug
    const allOrders = await Order.find({}).limit(5);
    console.log('📋 Sample orders in DB:', allOrders.map(o => ({ 
      orderId: o.orderId, 
      email: o.email, 
      userId: o.userId?.toString(),
      name: o.name 
    })));
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('❌ Error in getUserOrders:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Calculate totals from real order data
    const subtotal = order.cartItems ? order.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const totalShipping = order.cartItems ? order.cartItems.reduce((sum, item) => sum + ((item.shippingCharges || 0) * item.quantity), 0) : 0;
    
    // Calculate GST on product + shipping for each item
    const totalGst = order.cartItems ? order.cartItems.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemShipping = (item.shippingCharges || 0) * item.quantity;
      const itemGstRate = item.gst || 18;
      const itemGstAmount = ((itemSubtotal + itemShipping) * itemGstRate) / 100;
      return sum + itemGstAmount;
    }, 0) : 0;
    
    // Calculate GST based on state
    const isGujaratDelivery = order.state && order.state.toLowerCase().includes('gujarat');
    const gstRate = 18; // Total GST rate
    const cgstRate = isGujaratDelivery ? gstRate / 2 : 0;
    const sgstRate = isGujaratDelivery ? gstRate / 2 : 0;
    const igstRate = isGujaratDelivery ? 0 : gstRate;
    
    const gstAmount = Math.round(totalGst);
    const shippingCharges = totalShipping;

    // Generate Invoice HTML
    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderId}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
            
            .header { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid #ddd; }
            .logo { display: flex; align-items: center; flex: 1; }
            .company-logo { width: 50px; height: 50px; background: linear-gradient(45deg, #FF6B35, #F7931E); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; margin-right: 10px; }
            .company-name { font-size: 20px; font-weight: bold; color: #FF6B35; }
            .invoice-date { text-align: right; font-size: 14px; font-weight: bold; }
            
            .company-details { display: flex; padding: 15px 20px; border-bottom: 1px solid #ddd; }
            .from-section, .to-section, .order-info { flex: 1; }
            .to-section { margin: 0 20px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .company-info { margin-bottom: 3px; font-size: 11px; }
            .order-info { text-align: right; }
            
            .product-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .product-table th { background: #f8f9fa; padding: 8px 6px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 11px; }
            .product-table td { padding: 8px 6px; border: 1px solid #ddd; text-align: center; font-size: 11px; }
            .product-name { text-align: left !important; }
            
            .invoice-date-banner { text-align: center; margin: 15px 20px; padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; font-weight: bold; color: #856404; }
            
            .invoice-summary { margin: 15px 20px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; padding: 3px 0; }
            .summary-label { font-weight: 500; }
            .summary-value { font-weight: bold; }
            .total-row { border-top: 1px solid #333; padding-top: 5px; margin-top: 8px; font-size: 14px; font-weight: bold; }
            
            @media print { body { margin: 0; } .invoice-container { box-shadow: none; } }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div class="logo">
                    <img src="data:image/png;base64,${fs.readFileSync(path.join(__dirname, '../../client/src/assets/logo.png')).toString('base64')}" alt="ST Logo" style="width: 120px; height: 80px; margin-right: 15px;" />
                    <div class="company-name" style="color: #0c0c0cff;">Shivarn Technologies</div>
                </div>
                <div class="invoice-date">
                    Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            </div>
            
            <div class="company-details">
                <div class="from-section">
                    <div class="section-title">From</div>
                    <div class="company-info"><strong>Shivarn Technologies</strong></div>
                    <div class="company-info">B-203, Gajanan Pride, Opp. Yug Residency,</div>
                    <div class="company-info">B/h St. Mary School, New Naroda,</div>
                    <div class="company-info">Ahmedabad - 382325</div>
                    <div class="company-info">Gujarat, India</div>
                    <div class="company-info">Email: info@shivarn.in</div>
                    <div class="company-info">GST: 24AENFS0009Q1ZP</div>
                </div>
                
                <div class="to-section">
                    <div class="section-title">To</div>
                    <div class="company-info"><strong>${order.name}</strong></div>
                    <div class="company-info">${order.streetAddress}</div>
                    <div class="company-info">${order.townCity}, ${order.state}</div>
                    <div class="company-info">${order.postcode}</div>
                    <div class="company-info">Phone: ${order.phone}</div>
                    <div class="company-info">Email: ${order.email}</div>
                </div>
                
                <div class="order-info">
                    <div class="company-info"><strong>Order ID:</strong> ${order.orderId}</div>
                    <div class="company-info"><strong>Payment Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div class="company-info"><strong>Payment Status:</strong> ${order.paymentStatus || 'Prepaid'}</div>
                </div>
            </div>
            
            <table class="product-table">
                <thead>
                    <tr>
                        <th>SL#</th>
                        <th>Product</th>
                        <th>HSN</th>
                        <th>QTY</th>
                        <th>RATE</th>
                        <th>GST RATE</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.cartItems ? order.cartItems.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="product-name">${item.title || item.name}</td>
                        <td>${item.hsnSacCode || ''}</td>
                        <td>${item.quantity}</td>
                        <td>₹ ${item.price}</td>
                        <td>${item.gst}%</td>
                        <td>₹ ${item.price * item.quantity}</td>
                    </tr>
                    `).join('') : `
                    <tr>
                        <td>1</td>
                        <td class="product-name">No items</td>
                        <td></td>
                        <td>0</td>
                        <td>₹ 0</td>
                        <td>18%</td>
                        <td>₹ 0</td>
                    </tr>
                    `}
                </tbody>
            </table>
            
            <div class="invoice-date-banner">
                Invoice Date ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            
            <div class="invoice-summary">
                <div class="summary-row">
                    <span class="summary-label">Subtotal:</span>
                    <span class="summary-value">₹ ${subtotal}</span>
                </div>
                ${isGujaratDelivery ? `
                <div class="summary-row">
                    <span class="summary-label">CGST (${cgstRate}%)</span>
                    <span class="summary-value">₹ ${Math.round(gstAmount / 2)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">SGST (${sgstRate}%)</span>
                    <span class="summary-value">₹ ${Math.round(gstAmount / 2)}</span>
                </div>
                ` : `
                <div class="summary-row">
                    <span class="summary-label">IGST (${igstRate}%)</span>
                    <span class="summary-value">₹ ${gstAmount}</span>
                </div>
                `}
                <div class="summary-row">
                    <span class="summary-label">Shipping:</span>
                    <span class="summary-value">₹ ${shippingCharges}</span>
                </div>
                <div class="summary-row total-row">
                    <span class="summary-label">Total (Round Off):</span>
                    <span class="summary-value">₹ ${Math.round(subtotal + gstAmount + shippingCharges)}</span>
                </div>
            </div>
        </div>
        
        <script>
            window.onload = function() {
                window.print();
            }
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { orderId },
      { 
        paymentStatus: 'cancelled',
        status: 'cancelled',
        notes: reason || 'Order cancelled by customer'
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getOrders,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  downloadInvoice,
  cancelOrder
};