const express = require('express');
const router = express.Router();
const repositorysController = require('../controllers/repositorysController');
const { validate_token } = require("../helper/validations")

router.post('/create_repository', [validate_token], repositorysController.create_repository);
router.get('/get_repositories', [validate_token], repositorysController.get_repositories);
router.put('/update_repository', [validate_token], repositorysController.update_repository);
router.delete('/delete_repository', [validate_token], repositorysController.delete_repository);
router.post('/approve_repository', [validate_token], repositorysController.approve_repository);

module.exports = router;