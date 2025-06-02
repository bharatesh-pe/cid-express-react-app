const express = require('express');
const router = express.Router();
const chargeSheetController = require('../controllers/chargeSheetController');

router.post('/getChargeSheet', chargeSheetController.getChargeSheetData);
router.post('/saveChargeSheet', chargeSheetController.saveChargeSheetData);
router.post('/updateChargeSheet', chargeSheetController.updateChargeSheetData);

module.exports = router;
