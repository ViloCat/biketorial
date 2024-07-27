const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PartOption' }]
});

const Part = mongoose.model('Part', PartSchema);

module.exports = Part;
