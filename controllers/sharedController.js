const Part = require('../models/Part');
const PartOption = require('../models/PartOption');
const CombinationRule = require('../models/CombinationRule');
const PriceRule = require('../models/PriceRule');

exports.getPartsWithOptions = async (req, res) => {
  try {
    const parts = await Part.find().populate('options');
    res.status(200).json(parts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

exports.getCombinationRules = async (req, res) => {
  try {
    const rules = await CombinationRule.find().populate('partOptions');
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getPriceRules = async (req, res) => {
  try {
    const rules = await PriceRule.find().populate('partOptions');
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
