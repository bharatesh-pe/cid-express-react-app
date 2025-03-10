const express = require('express');
const profileHistoryController = require('../controllers/profileHistoryController');
const { getProfileHistoryValidation } = require('../validations/profileHistoryValidations');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const router = express.Router();


router.post('/getProfileHistory', userAuthMiddleware, getProfileHistoryValidation, profileHistoryController.getProfileHistory);


module.exports = router;