const express = require('express');
const profileOrganizationController = require('../controllers/profileOrganizationController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { addProfileOrganizationValidation, updateProfileOrganizationValidation, viewProfileOrganizationValidation } = require('../validations/profileOrganizationValidations');
const router = express.Router();


router.post('/addProfileOrganization', addProfileOrganizationValidation, profileOrganizationController.addProfileOrganization);
router.post('/updateProfileOrganization', updateProfileOrganizationValidation, profileOrganizationController.updateProfileOrganization);
router.post('/viewProfileOrganization', viewProfileOrganizationValidation, profileOrganizationController.viewProfileOrganization);


module.exports = router;