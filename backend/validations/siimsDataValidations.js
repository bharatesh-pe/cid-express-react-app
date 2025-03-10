const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const getSectionsValidation = (req, res, next) => {
    return Validate([
        // Validate unit_id
        body("unit_id")
            .exists({ checkFalsy: true })
            .withMessage("Unit ID is required")
            .isInt({ min: 1 })
            .withMessage("Unit ID must be a positive integer"),
    ])(req, res, next);
};


const getDesksValidation = (req, res, next) => {
    return Validate([
        // Validate unit_id
        body("unit_id")
            .exists({ checkFalsy: true })
            .withMessage("Unit ID is required")
            .isInt({ min: 1 })
            .withMessage("Unit ID must be a positive integer"),
        // Validate section_id
        body("section_id")
            .exists({ checkFalsy: true })
            .withMessage("Section ID is required")
            .isInt({ min: 1 })
            .withMessage("Section ID must be a positive integer"),
    ])(req, res, next);
};


const getDistrictsValidation = (req, res, next) => {
    return Validate([
        // Validate state_id
        body("state_id")
            .exists({ checkFalsy: true })
            .withMessage("State ID is required")
            .isInt({ min: 1 })
            .withMessage("State ID must be a positive integer"),
    ])(req, res, next);
};


module.exports = {
    getSectionsValidation,
    getDesksValidation,
    getDistrictsValidation
};