const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

router.get('/parts', sharedController.getPartsWithOptions);

router.get('/combination-rules', sharedController.getCombinationRules);

router.get('/price-rules', sharedController.getPriceRules);

module.exports = router;
