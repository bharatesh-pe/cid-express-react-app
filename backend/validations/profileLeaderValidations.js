const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const addProfileLeaderValidation = (req, res, next) => {
    return Validate([
        // Validate template_id (required, positive integer, references the 'templates' table)
        body("template_id")
            .exists({ checkFalsy: true })
            .withMessage("Template ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Template ID must be a positive integer."),

        // Validate table_row_id (required, positive integer)
        body("table_row_id")
            .exists({ checkFalsy: true })
            .withMessage("Table Row ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Table Row ID must be a positive integer."),

        // Validate leader_id (required, positive integer, references the 'leader' table)
        body("leader_id")
            .exists({ checkFalsy: true })
            .withMessage("Leader ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Leader ID must be a positive integer."),
    ])(req, res, next);
};


const updateProfileLeaderValidation = (req, res, next) => {
    return Validate([
        // Validate profile_leader_id (required, positive integer, references the 'profile_leaders' table)
        body("profile_leader_id")
            .exists({ checkFalsy: true })
            .withMessage("Profile Leader ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Profile Leader ID must be a positive integer."),
        // Validate template_id (required, positive integer, references the 'templates' table)
        body("template_id")
            .exists({ checkFalsy: true })
            .withMessage("Template ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Template ID must be a positive integer."),

        // Validate table_row_id (required, positive integer)
        body("table_row_id")
            .exists({ checkFalsy: true })
            .withMessage("Table Row ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Table Row ID must be a positive integer."),

        // Validate leader_id (required, positive integer, references the 'leader' table)
        body("leader_id")
            .exists({ checkFalsy: true })
            .withMessage("Leader ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Leader ID must be a positive integer."),
    ])(req, res, next);
};


const viewProfileLeaderValidation = (req, res, next) => {
    return Validate([
        // Validate profile_leader_id (required, positive integer, references the 'profile_leaders' table)
        body("profile_leader_id")
            .exists({ checkFalsy: true })
            .withMessage("Profile Leader ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Profile Leader ID must be a positive integer."),
    ])(req, res, next);
};


module.exports = { addProfileLeaderValidation, updateProfileLeaderValidation, viewProfileLeaderValidation };