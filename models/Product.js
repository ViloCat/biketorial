const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    parts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Part' }],
    available: { type: Boolean, default: false },
    rules: {
        combinationRules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CombinationRule' }],
        priceRules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PriceRule' }]
    }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
