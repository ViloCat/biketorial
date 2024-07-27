const mongoose = require('mongoose');

const CombinationRuleSchema = new mongoose.Schema({
  partOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption', required: true }],
  condition: { type: String, enum: ['forbidden'], required: true },
});

const CombinationRule = mongoose.model('CombinationRule', CombinationRuleSchema);

module.exports = CombinationRule;
