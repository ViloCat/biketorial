const CombinationRule = require('../models/CombinationRule');

class CombinationService {
  /**
   * Validates the combination rules for the given part options.
   * @param {Array} partOptions - Array of part option IDs.
   * @returns {Object} - Validation result with a validity flag and a message.
   */
  async validateCombinationRules(partOptions) {
    const combinationRules = await CombinationRule.find().populate('partOptions');
    for (const rule of combinationRules) {
      if (rule.condition === 'incompatible') {
        const conflictingSelectedOptions = rule.partOptions.filter(option => partOptions.includes(option._id.toString()));
        if (conflictingSelectedOptions.length > rule.partOptions.length - 1) {
          return { valid: false, message: 'Order contains incompatible combination of part options' };
        }
      }
      if (rule.condition === 'exclusive') {
        const includedOptions = rule.partOptions.filter(option => partOptions.includes(option._id.toString()));
        if (includedOptions.length > 1) {
          return { valid: false, message: 'Order contains exclusive combination of part options' };
        }
      }
    }
    return { valid: true };
  }
}

module.exports = new CombinationService();
