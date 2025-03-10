const express = require('express');

const siimsController = require('../controllers/siimsController');
const authValidations = require('../validations/authValidations');
const siimsDataValidations = require('../validations/siimsDataValidations');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const router = express.Router();
const jwt = require("jsonwebtoken");

const eitherAuthMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Decode the token without verification to inspect its payload
        const decoded = jwt.decode(token);

        // Check if it's a user or admin token
        if (decoded?.user_id) {
            // Handle user authentication
            await new Promise((resolve, reject) =>
                userAuthMiddleware(req, res, err => (err ? reject(err) : resolve()))
            );
            return next();
        } else if (decoded?.admin_user_id) {
            // Handle admin authentication
            await new Promise((resolve, reject) =>
                adminAuthMiddleware(req, res, err => (err ? reject(err) : resolve()))
            );
            return next();
        } else {
            return res.status(401).json({ error: "Invalid token payload." });
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid token." });
    }
};


// router.post('/login', authValidations, siimsController.loginController)
router.post('/adminLogin', authValidations.adminLoginValidation, siimsController.adminLogin)
router.post('/login', authValidations.LoginValidation, siimsController.loginController)
router.post('/encrypt', siimsController.encryptAdminUserTokenId)
router.post('/userLogin', authValidations.userLoginValidation, siimsController.userLogin)
router.post('/userEncrypt', siimsController.encryptUserTokenId)
router.post('/addField', adminAuthMiddleware, siimsController.addField)
router.post('/updateField', adminAuthMiddleware, siimsController.updateField)
router.post('/deleteField', adminAuthMiddleware, siimsController.deleteField)
router.post('/getAllFields', adminAuthMiddleware, siimsController.getAllFields)
router.post('/getFormFields',
    // adminAuthMiddleware,
    siimsController.getFormFields)
router.post('/viewField', eitherAuthMiddleware, siimsController.viewField)
router.post('/paginateFields', eitherAuthMiddleware, siimsController.paginateFields)
router.post('/getLeaders', eitherAuthMiddleware, siimsController.getLeaders)
router.post('/getUnits', eitherAuthMiddleware, siimsController.getUnits)
router.post('/getAllFolderCategories', eitherAuthMiddleware, siimsController.getAllFolderCategories)
router.post('/getOrganizations', eitherAuthMiddleware, siimsController.getOrganizations)
router.post('/getDesignations', eitherAuthMiddleware, siimsController.getDesignations)
router.post('/getTaluks', eitherAuthMiddleware, siimsController.getTaluks)
router.post('/getSections', eitherAuthMiddleware, siimsDataValidations.getSectionsValidation, siimsController.getSections)
router.post('/getDesks', eitherAuthMiddleware, siimsDataValidations.getDesksValidation, siimsController.getDesks)
router.post('/paginateLeaders', eitherAuthMiddleware, siimsController.paginateLeaders)
router.post('/paginateOrganizations', eitherAuthMiddleware, siimsController.paginateOrganizations)
router.post('/getStates', eitherAuthMiddleware, siimsController.getStates)
router.post('/getDistricts', eitherAuthMiddleware, siimsDataValidations.getDistrictsValidation, siimsController.getDistricts)

module.exports = router;