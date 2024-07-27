const Part = require('../models/Part');
const PartOption = require('../models/PartOption');
const CombinationRule = require('../models/CombinationRule');
const PriceRule = require('../models/PriceRule');
const Product = require('../models/Product');
const BaseController = require('./baseController');

class AdminController extends BaseController {
  /**
   * Retrieves parts with all their options for a given product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getPartsWithAllOptions(req) {
    const productId = req.query.productId;
    const product = await Product.findById(productId).populate('parts');
    if (!product) return { status: 404, data: 'Product not found' };
    const parts = await Part.find({ _id: { $in: product.parts } }).populate('options');
    return { status: 200, data: parts };
  }

  /**
   * Creates a new part.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createPart(req) {
    const part = new Part(req.body);
    await part.save();
    if (req.body.productIds && req.body.productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: req.body.productIds } },
        { $push: { parts: part._id } }
      );
    }
    return { status: 201, data: part };
  }

  /**
   * Updates an existing part.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async updatePart(req) {
    const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!part) return { status: 404, data: 'Part not found' };
    if (req.body.productIds && req.body.productIds.length > 0) {
      await Product.updateMany(
        { parts: part._id },
        { $pull: { parts: part._id } }
      );
      await Product.updateMany(
        { _id: { $in: req.body.productIds } },
        { $push: { parts: part._id } }
      );
    }
    return { status: 200, data: part };
  }

  /**
   * Deletes an existing part.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deletePart(req) {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return { status: 404, data: 'Part not found' };
    return { status: 204, data: null };
  }

  /**
   * Creates a new part option.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createPartOption(req) {
    const partOption = new PartOption(req.body);
    await partOption.save();
    await Part.findByIdAndUpdate(partOption.part, { $push: { options: partOption._id } });
    return { status: 201, data: partOption };
  }

  /**
   * Updates an existing part option.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async updatePartOption(req) {
    const partOption = await PartOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partOption) return { status: 404, data: 'PartOption not found' };
    return { status: 200, data: partOption };
  }

  /**
   * Deletes an existing part option.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deletePartOption(req) {
    const partOption = await PartOption.findByIdAndDelete(req.params.id);
    if (!partOption) return { status: 404, data: 'PartOption not found' };
    await Part.findByIdAndUpdate(partOption.part, { $pull: { options: partOption._id } });
    return { status: 204, data: null };
  }

  /**
   * Creates a new combination rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createCombinationRule(req) {
    const combinationRule = new CombinationRule(req.body);
    await combinationRule.save();
    await Product.findByIdAndUpdate(req.body.productId, {
      $push: { 'rules.combinationRules': combinationRule._id }
    });
    return { status: 201, data: combinationRule };
  }

  /**
   * Updates an existing combination rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async updateCombinationRule(req) {
    const combinationRule = await CombinationRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combinationRule) return { status: 404, data: 'CombinationRule not found' };
    return { status: 200, data: combinationRule };
  }

  /**
   * Deletes an existing combination rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deleteCombinationRule(req) {
    const combinationRule = await CombinationRule.findByIdAndDelete(req.params.id);
    if (!combinationRule) return { status: 404, data: 'CombinationRule not found' };
    await Product.updateMany(
      { 'rules.combinationRules': combinationRule._id },
      { $pull: { 'rules.combinationRules': combinationRule._id } }
    );
    return { status: 204, data: null };
  }

  /**
   * Creates a new price rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createPriceRule(req) {
    const priceRule = new PriceRule(req.body);
    await priceRule.save();
    await Product.findByIdAndUpdate(req.body.productId, {
      $push: { 'rules.priceRules': priceRule._id }
    });
    return { status: 201, data: priceRule };
  }

  /**
   * Updates an existing price rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async updatePriceRule(req) {
    const priceRule = await PriceRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!priceRule) return { status: 404, data: 'PriceRule not found' };
    return { status: 200, data: priceRule };
  }

  /**
   * Deletes an existing price rule.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deletePriceRule(req) {
    const priceRule = await PriceRule.findByIdAndDelete(req.params.id);
    if (!priceRule) return { status: 404, data: 'PriceRule not found' };
    await Product.updateMany(
      { 'rules.priceRules': priceRule._id },
      { $pull: { 'rules.priceRules': priceRule._id } }
    );
    return { status: 204, data: null };
  }

  /**
   * Creates a new product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createProduct(req) {
    const product = new Product(req.body);
    await product.save();
    return { status: 201, data: product };
  }

  /**
   * Updates an existing product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async updateProduct(req) {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return { status: 404, data: 'Product not found' };
    return { status: 200, data: product };
  }

  /**
   * Retrieves all products.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getAllProducts(req) {
    const products = await Product.find();
    return { status: 200, data: products };
  }

  /**
   * Deletes an existing product.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deleteProduct(req) {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return { status: 404, data: 'Product not found' };
    return { status: 204, data: null };
  }
}

module.exports = new AdminController();
