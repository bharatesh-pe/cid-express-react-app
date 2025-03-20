const express = require('express');
const router = express.Router();
const casesActionController = require('../controllers/casesActionController');
const { validate_token } = require("../helper/validations")

router.get('/get_overall_actions', casesActionController.get_overall_actions);
router.post('/get_actions', casesActionController.get_actions);
router.post('/insert_action', casesActionController.insert_action);
router.post('/delete_action', casesActionController.delete_action);
router.get('/get_other_templates', casesActionController.get_other_templates);

module.exports = router; 