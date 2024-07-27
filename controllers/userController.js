const PartOption = require('../models/PartOption');
const Order = require('../models/Order');
const CombinationRule = require('../models/CombinationRule');
const PriceRule = require('../models/PriceRule');

exports.createOrder = async (req, res) => {
  try {
    const { partOptions } = req.body;
    
    const combinationRules = await CombinationRule.find().populate('partOptions');
    for (const rule of combinationRules) {
      if (rule.condition === 'forbidden') {
        const forbidden = rule.partOptions.every(option => partOptions.includes(option._id.toString()));
        if (forbidden) {
          return res.status(400).send('Order contains forbidden combination of part options');
        }
      }
    }
    
    let totalPrice = 0;
    const options = await PartOption.find({ '_id': { $in: partOptions } });
    for (const option of options) {
      totalPrice += option.cost;
    }
    
    const priceRules = await PriceRule.find().populate('partOptions');
    for (const rule of priceRules) {
      const applies = rule.partOptions.every(option => partOptions.includes(option._id.toString()));
      if (applies) {
        totalPrice += rule.modifiedPrice;
      }
    }
    
    const order = new Order({ partOptions, totalPrice });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
