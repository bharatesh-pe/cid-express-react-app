const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate_token } = require("../helper/validations")

router.post('/create_user', [validate_token], userController.create_user);
router.post('/update_user', [validate_token], userController.update_user);
router.post('/user_active_deactive', [validate_token], userController.user_active_deactive);
router.post('/get_users', [validate_token], userController.get_users);
router.post('/filter_users', [validate_token], userController.filter_users);
router.post('/get_user_management_logs', [validate_token], userController.get_user_management_logs);

module.exports = router; 