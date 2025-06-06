const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

const { validate_token } = require("../helper/validations")
router.post('/create_role', [validate_token], roleController.create_role);
router.post('/get_all_roles', [validate_token], roleController.get_all_roles);
router.post('/get_all_permissions', [validate_token], roleController.get_all_permissions);
router.post('/update_role', [validate_token], roleController.update_role);
router.post('/delete_role', [validate_token], roleController.delete_role);
router.post('/get_all_module', [validate_token], roleController.get_all_module);

module.exports = router; 