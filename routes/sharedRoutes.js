const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

// Shared routes
router.get('/products', (req, res) => sharedController.handleRequest(req, res, sharedController.getAvailableProducts));
router.get('/parts', (req, res) => sharedController.handleRequest(req, res, sharedController.getPartsWithAvailableOptions));
router.get('/combination-rules', (req, res) => sharedController.handleRequest(req, res, sharedController.getCombinationRules));
router.get('/price-rules', (req, res) => sharedController.handleRequest(req, res, sharedController.getPriceRules));

module.exports = router;
