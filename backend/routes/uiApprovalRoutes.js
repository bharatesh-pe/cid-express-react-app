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
  "/mark_alert_notification_read",
  [validate_token],
  uiCaseApprovalController.mark_alert_notification_read
);
router.post(
  "/get_case_approval_by_id",
  [validate_token],
  uiCaseApprovalController.get_case_approval_by_id
);
router.post(
  "/update_ui_case_approval",
  [validate_token],
  uiCaseApprovalController.update_ui_case_approval
);
router.post(
  "/delete_ui_case_approval",
  [validate_token],
  uiCaseApprovalController.delete_ui_case_approval
);
router.post(
  "/get_approval_field_log",
  [validate_token],
  uiCaseApprovalController.get_approval_field_log
);
router.post(
  "/get_approval_activity_log",
  [validate_token],
  uiCaseApprovalController.get_approval_activity_log
);

module.exports = router;
