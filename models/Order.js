const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  partOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption', required: true }],
  subtotalPrice: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  items: [ItemSchema],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['in_cart', 'completed'], required: true },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
