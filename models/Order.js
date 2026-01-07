const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  orderNumber: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  streetAddress: {
    type: String,
    required: true
  },
  townCity: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  gstin: {
    type: String
  },
  cartItems: [{
    _id: String,
    title: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    hsnSacCode: String,
    gst: Number,
    shippingCharges: Number,
    specifications: mongoose.Schema.Types.Mixed,
    stockStatus: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'phonepe'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for backward compatibility
orderSchema.virtual('customerName').get(function() {
  return this.name;
});

orderSchema.virtual('customerEmail').get(function() {
  return this.email;
});

orderSchema.virtual('customerPhone').get(function() {
  return this.phone;
});

orderSchema.virtual('customerAddress').get(function() {
  return `${this.streetAddress}, ${this.townCity}, ${this.state} - ${this.postcode}`;
});

orderSchema.virtual('items').get(function() {
  return this.cartItems || [];
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);