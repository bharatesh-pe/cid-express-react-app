const express = require('express');
const router = express.Router();
const casesActionController = require('../controllers/casesActionController');
const { validate_token } = require("../helper/validations")

router.get('/get_overall_actions', [validate_token], casesActionController.get_overall_actions);
router.post('/get_actions', [validate_token], casesActionController.get_actions);
router.post('/insert_action', [validate_token], casesActionController.insert_action);
router.post('/delete_action', [validate_token], casesActionController.delete_action);
router.get('/get_other_templates', [validate_token], casesActionController.get_other_templates);

module.exports = router; 