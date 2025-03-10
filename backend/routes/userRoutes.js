const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const { validate_create_user , validate_update_user} = require('../middleware/validateUser');
const { validateToken } = require('../helper/validations');

// router.post('/create_user', [validateToken], userController.create_user);
// router.put('/update_user', [validateToken], userController.update_user);

module.exports = router;