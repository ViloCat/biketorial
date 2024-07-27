const Part = require('../models/Part');
const PartOption = require('../models/PartOption');
const CombinationRule = require('../models/CombinationRule');
const PriceRule = require('../models/PriceRule');

exports.createPart = async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.status(201).json(part);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updatePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!part) return res.status(404).send('Part not found');
    res.status(200).json(part);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).send('Part not found');
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createPartOption = async (req, res) => {
  try {
    const partOption = new PartOption(req.body);
    await partOption.save();
    
    await Part.findByIdAndUpdate(partOption.part, { $push: { options: partOption._id } });
    
    res.status(201).json(partOption);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
};

exports.updatePartOption = async (req, res) => {
  try {
    const partOption = await PartOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partOption) return res.status(404).send('PartOption not found');
    res.status(200).json(partOption);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deletePartOption = async (req, res) => {
  try {
    const partOption = await PartOption.findByIdAndDelete(req.params.id);
    if (!partOption) return res.status(404).send('PartOption not found');
    
    await Part.findByIdAndUpdate(partOption.part, { $pull: { options: partOption._id } });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createCombinationRule = async (req, res) => {
  try {
    const combinationRule = new CombinationRule(req.body);
    await combinationRule.save();
    res.status(201).json(combinationRule);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateCombinationRule = async (req, res) => {
  try {
    const combinationRule = await CombinationRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combinationRule) return res.status(404).send('CombinationRule not found');
    res.status(200).json(combinationRule);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteCombinationRule = async (req, res) => {
  try {
    const combinationRule = await CombinationRule.findByIdAndDelete(req.params.id);
    if (!combinationRule) return res.status(404).send('CombinationRule not found');
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.createPriceRule = async (req, res) => {
  try {
    const priceRule = new PriceRule(req.body);
    await priceRule.save();
    res.status(201).json(priceRule);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updatePriceRule = async (req, res) => {
  try {
    const priceRule = await PriceRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!priceRule) return res.status(404).send('PriceRule not found');
    res.status(200).json(priceRule);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deletePriceRule = async (req, res) => {
  try {
    const priceRule = await PriceRule.findByIdAndDelete(req.params.id);
    if (!priceRule) return res.status(404).send('PriceRule not found');
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};
