const Order = require('../models/Order');

const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('📄 Generating invoice for order:', orderId);
    
    // Find the order
    const order = await Order.findOne({ orderId: orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('📦 Order found:', order.orderId);
    
    // Generate HTML invoice
    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tax Invoice - ${order.orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 15px; font-size: 12px; }
            .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #000; }
            .header { text-align: center; padding: 10px; border-bottom: 1px solid #000; }
            .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
            .company-section { display: flex; padding: 10px; border-bottom: 1px solid #000; }
            .company-left { flex: 2; }
            .company-right { flex: 1; text-align: right; }
            .qr-placeholder { width: 80px; height: 80px; border: 1px solid #000; margin-left: auto; }
            .invoice-details { display: flex; padding: 10px; border-bottom: 1px solid #000; }
            .left-details { flex: 1; }
            .right-details { flex: 1; text-align: right; }
            .addresses { display: flex; padding: 10px; border-bottom: 1px solid #000; }
            .bill-to, .ship-to { flex: 1; }
            .ship-to { border-left: 1px solid #000; padding-left: 10px; }
            .items-header { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { background: #f0f0f0; padding: 8px; text-align: center; border: 1px solid #000; font-size: 10px; }
            .items-table td { padding: 8px; border: 1px solid #000; font-size: 10px; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .grand-total { text-align: right; padding: 15px; font-size: 16px; font-weight: bold; }
            .footer-note { text-align: right; padding: 10px; font-style: italic; font-size: 10px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <h1>Tax Invoice</h1>
            </div>
            
            <div class="company-section">
                <div class="company-left">
                    <strong>Sold By: Shivarn Technologies Private Limited</strong><br>
                    <strong>Ship-from Address:</strong> 123, Water Treatment Complex, Industrial Area Phase-1,<br>
                    Near Railway Station, Patan - 384265, Gujarat, India - 384265, IN-GJ<br><br>
                    <strong>GSTIN</strong> - 24AAGCK4304E1Z1<br>
                    <strong>IRN</strong> - ${order.orderId}f30ae9f464d761bd88670f0c8347aae1b7f8b23965e8fb171af4905ec6
                </div>
                <div class="company-right">
                    <div class="qr-placeholder"></div><br>
                    <strong>Invoice Number # FAIGSS2500021392</strong>
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="left-details">
                    <strong>Order ID:</strong><br>
                    ${order.orderId}<br><br>
                    <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB')}<br>
                    <strong>Invoice Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br><br>
                    <strong>PAN:</strong> AAGCK4304E<br>
                    <strong>CIN:</strong> U52609KA2017PTC100306
                </div>
                <div class="right-details">
                    *Keep this invoice and<br>
                    manufacturer box for<br>
                    warranty purposes.
                </div>
            </div>
            
            <div class="addresses">
                <div class="bill-to">
                    <strong>Bill To</strong><br>
                    ${order.name}<br>
                    SHIVARN TECHNOLOGIES<br>
                    At: Bhogilaluda, Umiya Parlar<br>
                    Dist. Patan, Dhanodharda,<br>
                    Chanasma 384220 Gujarat<br>
                    Phone: ${order.phone}
                </div>
                <div class="ship-to">
                    <strong>Ship To</strong><br>
                    ${order.name}<br>
                    At: ${order.streetAddress}<br>
                    Dist. ${order.townCity}, ${order.state},<br>
                    ${order.postcode} Gujarat<br>
                    Phone: ${order.phone}
                </div>
            </div>
            
            <div class="items-header">
                Total Items: ${order.cartItems ? order.cartItems.length : 0}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th rowspan="2">Product</th>
                        <th rowspan="2">Title</th>
                        <th rowspan="2">Qty</th>
                        <th rowspan="2">Gross<br>Amount ₹</th>
                        <th rowspan="2">Discounts<br>/Coupons<br>₹</th>
                        <th rowspan="2">Taxable<br>Value ₹</th>
                        <th colspan="2">CGST ₹</th>
                        <th rowspan="2">SGST<br>/UTGST<br>₹</th>
                        <th rowspan="2">Total ₹</th>
                    </tr>
                    <tr>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.cartItems ? order.cartItems.map(item => {
                        const productAmount = item.price * item.quantity;
                        const shippingCharges = item.shippingCharges || 0;
                        const discount = 0;
                        
                        // Product GST calculation
                        const productTaxableValue = productAmount - discount;
                        const productCgstRate = 9;
                        const productCgstAmount = (productTaxableValue * productCgstRate) / 100;
                        const productSgstAmount = productCgstAmount;
                        
                        // Shipping GST calculation
                        const shippingCgstAmount = (shippingCharges * productCgstRate) / 100;
                        const shippingSgstAmount = shippingCgstAmount;
                        
                        // Total calculations
                        const totalCgstAmount = productCgstAmount + shippingCgstAmount;
                        const totalSgstAmount = productSgstAmount + shippingSgstAmount;
                        const grossAmount = productAmount + shippingCharges;
                        const taxableValue = productTaxableValue + shippingCharges;
                        const totalAmount = taxableValue + totalCgstAmount + totalSgstAmount;
                        
                        return `
                        <tr>
                            <td>Water Treatment Equipment<br>FSN: MOBGTAGPYYWZRUJX<br>HSN/SAC: 85171300</td>
                            <td><strong>${item.title || item.name || 'Product'}</strong><br>
                            Product: ₹${productAmount.toFixed(2)}<br>
                            Shipping: ₹${shippingCharges.toFixed(2)}<br>
                            Product GST: ₹${(productCgstAmount + productSgstAmount).toFixed(2)}<br>
                            Shipping GST: ₹${(shippingCgstAmount + shippingSgstAmount).toFixed(2)}<br>
                            Warranty: 1 Year Equipment + 6 Months Accessories<br>
                            Serial No: ${order.orderId.slice(-12)}<br><br>
                            <strong>CGST:</strong> ${productCgstRate} %<br>
                            <strong>SGST/UTGST:</strong> ${productCgstRate} %</td>
                            <td style="text-align: center;"><strong>${item.quantity}</strong></td>
                            <td style="text-align: right;">${grossAmount.toFixed(2)}</td>
                            <td style="text-align: right;">${discount > 0 ? '-' + discount.toFixed(2) : '0.00'}</td>
                            <td style="text-align: right;">${taxableValue.toFixed(2)}</td>
                            <td style="text-align: right;">${productCgstRate.toFixed(1)}</td>
                            <td style="text-align: right;">${totalCgstAmount.toFixed(2)}</td>
                            <td style="text-align: right;">${totalSgstAmount.toFixed(2)}</td>
                            <td style="text-align: right;">${totalAmount.toFixed(2)}</td>
                        </tr>
                        `;
                    }).join('') : '<tr><td colspan="10">No items found</td></tr>'}
                    
                    <tr>
                        <td colspan="10" style="padding: 8px; text-align: center;"><strong>Shipping And Packaging Charges</strong></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td style="text-align: center;">1</td>
                        <td style="text-align: right;">70.00</td>
                        <td style="text-align: right;">-70.00</td>
                        <td style="text-align: right;">0.00</td>
                        <td style="text-align: right;">0.00</td>
                        <td style="text-align: right;">0.00</td>
                        <td style="text-align: right;">0.00</td>
                        <td style="text-align: right;">0.00</td>
                    </tr>
                    
                    <tr class="total-row">
                        <td colspan="2" style="text-align: center;"><strong>Total</strong></td>
                        <td style="text-align: center;"><strong>${order.cartItems ? order.cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0}</strong></td>
                        <td style="text-align: right;"><strong>${(order.totalAmount + 70).toFixed(2)}</strong></td>
                        <td style="text-align: right;"><strong>-70.00</strong></td>
                        <td style="text-align: right;"><strong>${(order.totalAmount * 0.847).toFixed(2)}</strong></td>
                        <td style="text-align: right;"><strong>${(order.totalAmount * 0.0765).toFixed(2)}</strong></td>
                        <td style="text-align: right;"><strong>${(order.totalAmount * 0.0765).toFixed(2)}</strong></td>
                        <td style="text-align: right;"><strong>${(order.totalAmount * 0.0765).toFixed(2)}</strong></td>
                        <td style="text-align: right;"><strong>${order.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="grand-total">
                Grand Total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₹ ${order.totalAmount.toFixed(2)}
            </div>
            
            <div class="footer-note">
                Shivarn Technologies Private Limited
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
    
    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
    
    console.log('✅ Invoice generated successfully');
    
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
};

module.exports = { generateInvoice };