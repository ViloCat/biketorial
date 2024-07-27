const PartOption = require('../models/PartOption');
const PriceRule = require('../models/PriceRule');

class PriceService {
  /**
   * Calculates the total price for the given part options, considering any price rules.
   * @param {Array} partOptions - Array of part option IDs.
   * @returns {Number} - The calculated total price.
   */
  async calculatePrice(partOptions) {
    let price = 0;
    const options = await PartOption.find({ '_id': { $in: partOptions } });
    options.forEach(option => {
      price += option.cost;
    });

    const priceRules = await PriceRule.find().populate('partOptions');
    priceRules.forEach(rule => {
      const applies = rule.partOptions.every(option => partOptions.includes(option._id.toString()));
      if (applies) {
        price += rule.modifiedPrice;
      }
    });

    return price;
  }
}

module.exports = new PriceService();
