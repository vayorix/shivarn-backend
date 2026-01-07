const mongoose = require('mongoose');

const sedimentFilterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  gst: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  shippingCharges: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  specifications: {
    type: [String],
    default: []
  },
  stockStatus: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  hsnSacCode: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SedimentFilter', sedimentFilterSchema);