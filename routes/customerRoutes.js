const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Order routes
router.post('/order', (req, res) => customerController.handleRequest(req, res, customerController.createOrder));
router.post('/order/complete', (req, res) => customerController.handleRequest(req, res, customerController.completeOrder));
router.get('/order/in_cart', (req, res) => customerController.handleRequest(req, res, customerController.getInCartOrder));
router.delete('/order/empty', (req, res) => customerController.handleRequest(req, res, customerController.deleteInCartOrder));

module.exports = router;
