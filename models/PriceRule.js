const mongoose = require('mongoose');

const PriceRuleSchema = new mongoose.Schema({
  partOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption', required: true }],
  modifiedPrice: { type: Number, required: true },
});

const PriceRule = mongoose.model('PriceRule', PriceRuleSchema);

module.exports = PriceRule;
