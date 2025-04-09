const express = require("express");
const router = express.Router();
const uiCaseApprovalController = require("../controllers/uiCaseApprovalController");
const { validate_token } = require("../helper/validations");

router.post(
  "/get_ui_case_approvals",
  [validate_token],
  uiCaseApprovalController.get_ui_case_approvals
);
router.post(
  "/create_ui_case_approval",
  [validate_token],
  uiCaseApprovalController.create_ui_case_approval
);
router.post(
  "/get_alert_notification",
  [validate_token],
  uiCaseApprovalController.get_alert_notification
);
router.post(
  "/get_case_approval_by_id",
  [validate_token],
  uiCaseApprovalController.get_case_approval_by_id
);

module.exports = router;
