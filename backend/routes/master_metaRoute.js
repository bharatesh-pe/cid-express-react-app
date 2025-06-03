const express = require('express');
const MetaMasterController = require('../controllers/master_metaController');
const { validate_token } = require("../helper/validations")
const router = express.Router();
router.post('/fetch_masters', [validate_token], MetaMasterController.fetch_masters_meta);
router.post('/fetch_specific_master_data', [validate_token], MetaMasterController.fetch_specific_master_data);
router.post('/create_master_data', [validate_token], MetaMasterController.create_master_data);
router.post('/update_master_data', [validate_token], MetaMasterController.update_master_data);
router.post('/delete_master_data', [validate_token], MetaMasterController.delete_master_data);

module.exports = router;