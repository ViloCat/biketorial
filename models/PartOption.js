const mongoose = require('mongoose');

const PartOptionSchema = new mongoose.Schema({
  part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
  name: { type: String, required: true },
  description: String,
  cost: { type: Number, required: true }
});

const PartOption = mongoose.model('PartOption', PartOptionSchema);

module.exports = PartOption;
