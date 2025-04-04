const express = require("express");
const {
  generate_OTP,
  verify_OTP,
  get_module,
  logout,
  generate_OTP_without_pin,
  verify_OTP_without_pin,
  update_pin,
} = require("../controllers/authController");
const { validate_token } = require("../helper/validations");

const router = express.Router();

// Route to generate OTP
router.post("/generate_OTP", generate_OTP);
router.post("/verify_OTP", verify_OTP);
router.post("/get_module", [validate_token], get_module);
router.post("/logout", [validate_token], logout);
router.post("/generate_OTP_without_pin", generate_OTP_without_pin);
router.post("/verify_OTP_without_pin", verify_OTP_without_pin);
router.post("/update_pin", update_pin);

module.exports = router;
