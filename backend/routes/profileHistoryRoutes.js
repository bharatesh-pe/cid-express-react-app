const express = require('express');
const profileHistoryController = require('../controllers/profileHistoryController');
const { getProfileHistoryValidation } = require('../validations/profileHistoryValidations');
const { validate_token } = require("../helper/validations")
const router = express.Router();


router.post('/getProfileHistory', [validate_token], getProfileHistoryValidation, profileHistoryController.getProfileHistory);


module.exports = router;