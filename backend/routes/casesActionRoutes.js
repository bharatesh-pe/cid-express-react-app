const express = require('express');
const router = express.Router();
const casesActionController = require('../controllers/casesActionController');
const { validate_token } = require("../helper/validations")

router.get('/get_overall_actions', [validate_token], casesActionController.get_overall_actions);
router.get('/get_actions', [validate_token], casesActionController.get_actions);
router.post('/insert_action', [validate_token], casesActionController.insert_action);
router.post('/delete_action', [validate_token], casesActionController.delete_action);

module.exports = router; 