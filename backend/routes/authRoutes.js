const express = require("express");
const {
  generate_OTP,
  verify_OTP,
  get_module,
  logout,
  generate_OTP_without_pin,
  verify_OTP_without_pin,
  update_pin,
  get_supervisor_id,
  set_user_hierarchy,
  fetch_dash_count,
  mapUIandPT,
  updatePoliceStationFromExcel,
  dumpOldCmsDataFromExcel,
  store_cnr_table_data,
  updatePoliceStationExcel,
  updateCourtFromExcel
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
router.post("/get_supervisor_id", [validate_token], get_supervisor_id);
router.post("/set_user_hierarchy", set_user_hierarchy);
router.post("/fetch_dash_count" , [validate_token], fetch_dash_count);
router.post("/mapUIandPT" , mapUIandPT);
router.post("/updatePoliceStationFromExcel" , updatePoliceStationFromExcel);
router.post("/dumpOldCmsDataFromExcel", dumpOldCmsDataFromExcel);
router.post("/store_cid_cnr_details", store_cnr_table_data);
router.post("/updatePoliceStationExcel", updatePoliceStationExcel);
router.post("/updateCourtFromExcel", updateCourtFromExcel);

module.exports = router;
