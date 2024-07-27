const Part = require('../models/Part');
const Product = require('../models/Product');
const BaseController = require('./baseController');

class SharedController extends BaseController {
  /**
   * Retrieves parts with available options for a given product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getPartsWithAvailableOptions(req, res) {
    const productId = req.query.productId;
    const product = await Product.findById(productId).populate('parts');
    if (!product) return { status: 404, data: 'Product not found' };
    const parts = await Part.find({ _id: { $in: product.parts } }).populate({
      path: 'options',
      match: { available: true }
    });
    return { status: 200, data: parts };
  }

  /**
   * Retrieves combination rules for a given product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getCombinationRules(req, res) {
    const productId = req.query.productId;
    const product = await Product.findById(productId).populate({
      path: 'rules.combinationRules',
      populate: {
        path: 'partOptions',
        model: 'PartOption'
      }
    });
    if (!product) return { status: 404, data: 'Product not found' };
    return { status: 200, data: product.rules.combinationRules };
  }

  /**
   * Retrieves price rules for a given product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getPriceRules(req, res) {
    const productId = req.query.productId;
    const product = await Product.findById(productId).populate({
      path: 'rules.priceRules',
      populate: {
        path: 'partOptions',
        model: 'PartOption'
      }
    });
    if (!product) return { status: 404, data: 'Product not found' };
    return { status: 200, data: product.rules.priceRules };
  }

  /**
   * Retrieves all available products.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getAvailableProducts(req, res) {
    const products = await Product.find({ available: true }).populate('parts');
    return { status: 200, data: products };
  }
}

module.exports = new SharedController();
