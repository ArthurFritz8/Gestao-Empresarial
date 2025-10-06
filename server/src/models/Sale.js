const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const SaleSchema = new mongoose.Schema({
  items: [SaleItemSchema],
  customer: {
    type: String,
    default: 'Cliente Anônimo',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'pix'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sale', SaleSchema);