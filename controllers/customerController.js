const Order = require('../models/Order');
const priceService = require('../services/priceService');
const combinationService = require('../services/combinationService');
const BaseController = require('./baseController');

class CustomerController extends BaseController {
  /**
   * Creates a new order.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async createOrder(req) {
    const { partOptions, productId } = req.body;

    const validation = await combinationService.validateCombinationRules(partOptions);
    if (!validation.valid) {
      return { status: 400, data: validation.message };
    }

    const subtotalPrice = await priceService.calculatePrice(partOptions);

    let order = await Order.findOne({ status: 'in_cart' });
    if (!order) {
      order = new Order({ items: [], totalPrice: 0, status: 'in_cart' });
    }

    order.items.push({ product: productId, partOptions, subtotalPrice });
    order.totalPrice += subtotalPrice;

    await order.save();
    await order.populate([
      {
        path: 'items.partOptions',
        populate: { path: 'part', select: '_id name description cost' }
      },
      {
        path: 'items.product',
        select: 'name'
      }
    ]);

    return { status: 201, data: order };
  }

  /**
   * Completes the current order.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async completeOrder(req) {
    const order = await Order.findOneAndUpdate({ status: 'in_cart' }, { status: 'completed' }, { new: true });
    if (!order) {
      return { status: 404, data: 'No in_cart order found' };
    }

    await order.populate('items.partOptions');
    return { status: 200, data: order };
  }

  /**
   * Retrieves the current order in the cart.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async getInCartOrder(req) {
    const order = await Order.findOne({ status: 'in_cart' }).populate({
      path: 'items.partOptions',
      populate: { path: 'part', select: '_id name description cost' }
    }).populate('items.product', 'name');
    if (!order) {
      return { status: 200, data: { status: 'not_found' } };
    }
    return { status: 200, data: order };
  }

  /**
   * Deletes the current order in the cart.
   * @param {Object} req - The request object.
   * @returns {Object} - The response object with status and data.
   */
  async deleteInCartOrder(req) {
    const order = await Order.findOneAndDelete({ status: 'in_cart' });
    if (!order) {
      return { status: 404, data: 'No in_cart order found' };
    }
    return { status: 204, data: null };
  }
}

module.exports = new CustomerController();
