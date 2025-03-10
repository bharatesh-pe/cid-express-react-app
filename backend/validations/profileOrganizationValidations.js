const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const addProfileOrganizationValidation = (req, res, next) => {
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

        // Validate organization_id (required, positive integer, references the 'organizations' table)
        body("organization_id")
            .exists({ checkFalsy: true })
            .withMessage("Organization ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Organization ID must be a positive integer."),
    ])(req, res, next);
};


const updateProfileOrganizationValidation = (req, res, next) => {
    return Validate([
        // Validate profile_organization_id (required, positive integer, references the 'profile_organizations' table)
        body("profile_organization_id")
            .exists({ checkFalsy: true })
            .withMessage("Profile Organization ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Profile Organization ID must be a positive integer."),

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

        // Validate organization_id (required, positive integer, references the 'organizations' table)
        body("organization_id")
            .exists({ checkFalsy: true })
            .withMessage("Organization ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Organization ID must be a positive integer."),
    ])(req, res, next);
};


const viewProfileOrganizationValidation = (req, res, next) => {
    return Validate([
        // Validate profile_organization_id (required, positive integer, references the 'profile_organizations' table)
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

    ])(req, res, next);
};


module.exports = { addProfileOrganizationValidation, updateProfileOrganizationValidation, viewProfileOrganizationValidation };