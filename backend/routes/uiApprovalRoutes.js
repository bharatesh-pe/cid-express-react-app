const express = require('express');
const router = express.Router();
const uiCaseApprovalController = require('../controllers/uiCaseApprovalController');

router.post('/get_ui_case_approvals', uiCaseApprovalController.get_ui_case_approvals);
router.post('/create_ui_case_approval', uiCaseApprovalController.create_ui_case_approval);

module.exports = router; 