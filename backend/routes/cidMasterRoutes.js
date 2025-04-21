const express = require('express');

const cidMasterController = require('../controllers/cidMasterController');
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



router.post('/getAllDepartment', cidMasterController.getAllDepartments)
router.post('/getAllDesignations', cidMasterController.getAllDesignations)
router.post('/getAllDivisions', cidMasterController.getAllDivisions)
router.post('/getIoUsers' , cidMasterController.getIoUsers)
router.post('/getIoUsersBasedOnDivision' , cidMasterController.getIoUsersBasedOnDivision)

module.exports = router;