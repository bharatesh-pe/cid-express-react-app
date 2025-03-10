const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const getProfileHistoryValidation = (req, res, next) => {
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

    ])(req, res, next);
};


module.exports = { getProfileHistoryValidation };