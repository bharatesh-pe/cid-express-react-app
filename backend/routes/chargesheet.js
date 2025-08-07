const express = require("express");
const router = express.Router();
const chargeSheetController = require("../controllers/chargeSheetController");

// Make sure all controller methods are correctly referenced
router.post("/getChargeSheet", chargeSheetController.getChargeSheetData);
router.post("/updateChargeSheet", chargeSheetController.updateChargeSheetData);
router.post("/getChargeSheetFullDetails", chargeSheetController.getChargeSheetFullDetails);
router.post("/saveChargeSheetData", chargeSheetController.saveChargeSheetData);
router.post("/getProfileAttachment", chargeSheetController.getProfileAttachment);

module.exports = router;
