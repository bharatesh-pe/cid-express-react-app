const express = require('express');
const { fetch_masters_meta} = require('../controllers/master_metaController');
const { validate_token } = require("../helper/validations")

const router = express.Router();

router.get('/fetch_masters', [validate_token], fetch_masters_meta);

module.exports = router;