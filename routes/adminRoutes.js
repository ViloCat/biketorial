const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Parts routes
router.get('/parts', (req, res) => adminController.handleRequest(req, res, adminController.getPartsWithAllOptions));
router.post('/parts', (req, res) => adminController.handleRequest(req, res, adminController.createPart));
router.put('/parts/:id', (req, res) => adminController.handleRequest(req, res, adminController.updatePart));
router.delete('/parts/:id', (req, res) => adminController.handleRequest(req, res, adminController.deletePart));

// Part options routes
router.post('/part-options', (req, res) => adminController.handleRequest(req, res, adminController.createPartOption));
router.put('/part-options/:id', (req, res) => adminController.handleRequest(req, res, adminController.updatePartOption));
router.delete('/part-options/:id', (req, res) => adminController.handleRequest(req, res, adminController.deletePartOption));

// Combination rules routes
router.post('/combination-rules', (req, res) => adminController.handleRequest(req, res, adminController.createCombinationRule));
router.put('/combination-rules/:id', (req, res) => adminController.handleRequest(req, res, adminController.updateCombinationRule));
router.delete('/combination-rules/:id', (req, res) => adminController.handleRequest(req, res, adminController.deleteCombinationRule));

// Price rules routes
router.post('/price-rules', (req, res) => adminController.handleRequest(req, res, adminController.createPriceRule));
router.put('/price-rules/:id', (req, res) => adminController.handleRequest(req, res, adminController.updatePriceRule));
router.delete('/price-rules/:id', (req, res) => adminController.handleRequest(req, res, adminController.deletePriceRule));

// Products routes
router.get('/products', (req, res) => adminController.handleRequest(req, res, adminController.getAllProducts));
router.post('/products', (req, res) => adminController.handleRequest(req, res, adminController.createProduct));
router.put('/products/:id', (req, res) => adminController.handleRequest(req, res, adminController.updateProduct));
router.delete('/products/:id', (req, res) => adminController.handleRequest(req, res, adminController.deleteProduct));

module.exports = router;
