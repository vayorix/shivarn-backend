const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');

// Import routes
const inquiryRoutes = require('./routes/inquiryRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const waterSoftenerRoutes = require('./routes/waterSoftenerRoutes');
const softenerSparesRoutes = require('./routes/softenerSparesRoutes');
const domesticRoRoutes = require('./routes/domesticRoRoutes');
const industrialRORoutes = require('./routes/industrialRORoutes');
const accessoryRoutes = require('./routes/accessoryRoutes');
const pumpsRoutes = require('./routes/pumpsRoutes');
const frpVesselsRoutes = require('./routes/frpVesselsRoutes');
const membraneRoutes = require('./routes/membraneRoutes');
const etpStpRoutes = require('./routes/etpStpRoutes');
const topSellingRoutes = require('./routes/topSellingRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', inquiryRoutes);
app.use('/api', authRoutes);
app.use('/api', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/water-softeners', waterSoftenerRoutes);
app.use('/api/softener-spares', softenerSparesRoutes);
app.use('/api/domestic-ro', domesticRoRoutes);
app.use('/api/industrial-ro', industrialRORoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/pumps', pumpsRoutes);
app.use('/api/frp-vessels', frpVesselsRoutes);
app.use('/api/membrane', membraneRoutes);
app.use('/api/etp-stp', etpStpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/top-selling', topSellingRoutes);

// Direct routes for user orders (for frontend compatibility)
const { getUserOrders, downloadInvoice, cancelOrder } = require('./controllers/orderController');
app.get('/api/user-orders', getUserOrders);
app.get('/api/download-invoice/:orderId', downloadInvoice);
app.post('/api/cancel-order/:orderId', cancelOrder);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});