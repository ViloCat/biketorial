const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  partOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption', required: true }],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
