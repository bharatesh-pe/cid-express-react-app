const express = require("express");
const router = express.Router();
const chargeSheetController = require("../controllers/chargeSheetController");

// Make sure all controller methods are correctly referenced
router.post("/getChargeSheet", chargeSheetController.getChargeSheetData);
router.post("/saveChargeSheet", chargeSheetController.saveChargeSheetData);
router.post("/updateChargeSheet", chargeSheetController.updateChargeSheetData);
router.post("/getChargeSheetFullDetails", chargeSheetController.getChargeSheetFullDetails);
router.post("/saveChargeSheetData", chargeSheetController.saveChargeSheetData);

module.exports = router;
