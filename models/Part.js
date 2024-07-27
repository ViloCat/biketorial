const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  options: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption' }], default: [] }
});

const Part = mongoose.model('Part', PartSchema);

module.exports = Part;
