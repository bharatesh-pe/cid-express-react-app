const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate_token } = require("../helper/validations")

router.post('/create_user', [validate_token], userController.create_user);
router.post('/update_user', [validate_token], userController.update_user);
router.post('/user_active_deactive', [validate_token], userController.user_active_deactive);
router.get('/get_users', [validate_token], userController.get_users);
router.post('/filter_users', [validate_token], userController.filter_users);

module.exports = router; 