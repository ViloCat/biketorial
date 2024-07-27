const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User route for placing an order
router.post('/order', userController.createOrder);

module.exports = router;
