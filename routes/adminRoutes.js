const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/parts', adminController.createPart);
router.put('/parts/:id', adminController.updatePart);
router.delete('/parts/:id', adminController.deletePart);

router.post('/part-options', adminController.createPartOption);
router.put('/part-options/:id', adminController.updatePartOption);
router.delete('/part-options/:id', adminController.deletePartOption);

router.post('/combination-rules', adminController.createCombinationRule);
router.put('/combination-rules/:id', adminController.updateCombinationRule);
router.delete('/combination-rules/:id', adminController.deleteCombinationRule);

router.post('/price-rules', adminController.createPriceRule);
router.put('/price-rules/:id', adminController.updatePriceRule);
router.delete('/price-rules/:id', adminController.deletePriceRule);

module.exports = router;
