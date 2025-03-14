const express = require('express');
const { get_master_data} = require('../controllers/masterController');
const { validate_token } = require("../helper/validations")

const router = express.Router();

router.post('/get_master_data', [validate_token], get_master_data);

module.exports = router;