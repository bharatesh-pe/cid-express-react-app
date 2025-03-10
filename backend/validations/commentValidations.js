const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const createCommentValidation = (req, res, next) => {
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

        // Validate comment (required, string, cannot be empty)
        body("comment")
            .exists({ checkFalsy: true })
            .withMessage("Comment is required.")
            .bail() // Stops further validations if this fails
            .isString()
            .withMessage("Comment must be a string.")
            .isLength({ max: 65535 })
            .withMessage("Comment cannot exceed 65535 characters."),

        // Validate comment_date (optional, must be a valid ISO8601 date)
        body("comment_date")
            .exists({ checkFalsy: true })
            .withMessage("Comment Date is required.")
            .isISO8601()
            .withMessage("Comment Date must be a valid ISO8601 date if provided."),
    ])(req, res, next);
};


const updateCommentValidation = (req, res, next) => {
    return Validate([
        // Validate comment_id (required, positive integer)
        body("comment_id")
            .exists({ checkFalsy: true })
            .withMessage("Comment ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Comment ID must be a positive integer."),

        // Validate table_row_id (required, positive integer)
        body("table_row_id")
            .exists({ checkFalsy: true })
            .withMessage("Table Row ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Table Row ID must be a positive integer."),

        // Validate comment (required, string, cannot be empty)
        body("comment")
            .exists({ checkFalsy: true })
            .withMessage("Comment is required.")
            .bail() // Stops further validations if this fails
            .isString()
            .withMessage("Comment must be a string.")
            .isLength({ max: 65535 })
            .withMessage("Comment cannot exceed 65535 characters."),

        // Validate comment_date (optional, must be a valid ISO8601 date)
        body("comment_date")
            .exists({ checkFalsy: true })
            .withMessage("Comment Date is required.")
            .isISO8601()
            .withMessage("Comment Date must be a valid ISO8601 date if provided."),
    ])(req, res, next);
};


const deleteCommentValidation = (req, res, next) => {
    return Validate([
        // Validate comment_id (required, positive integer)
        body("comment_id")
            .exists({ checkFalsy: true })
            .withMessage("Comment ID is required.")
            .isInt({ min: 1 })
            .withMessage("Comment ID must be a positive integer."),

        // Validate template_id (required, positive integer, references 'templates' table)
        body("template_id")
            .exists({ checkFalsy: true })
            .withMessage("Template ID is required.")
            .isInt({ min: 1 })
            .withMessage("Template ID must be a positive integer."),

        // Validate table_row_id (required, positive integer)
        body("table_row_id")
            .exists({ checkFalsy: true })
            .withMessage("Table Row ID is required.")
            .isInt({ min: 1 })
            .withMessage("Table Row ID must be a positive integer."),
    ])(req, res, next);
};


const viewCommentValidation = (req, res, next) => {
    return Validate([
        // Validate comment_id (required, positive integer)
        body("comment_id")
            .exists({ checkFalsy: true })
            .withMessage("Comment ID is required.")
            .isInt({ min: 1 })
            .withMessage("Comment ID must be a positive integer."),
    ])(req, res, next);
};


const getCommentsValidation = (req, res, next) => {
    return Validate([
        // Validate template_id (required, positive integer, references 'templates' table)
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


const paginateCommentsValidation = (req, res, next) => {
    return Validate([
        // Validate template_id (required, positive integer, references the 'templates' table)
        body("template_id")
            .exists({ checkFalsy: true })
            .withMessage("Template ID is required.")
            .bail() // Stops further validations if this fails
            .isInt({ min: 1 })
            .withMessage("Template ID must be a positive integer."),

        body("table_row_id")
            .exists()
            .notEmpty()
            .withMessage("Table row ID is required.")
            .bail()
            .isInt({ min: 1 })
            .withMessage("Table row ID must be an integer greater than or equal to 1."),

        body("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be an integer greater than or equal to 1.")
            .toInt(),

        body("limit")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Limit must be an integer greater than or equal to 1.")
            .toInt(),

        body("sort_by")
            .optional()
            .isString()
            .trim()
            .escape()
            .exists()
            .notEmpty()
            .withMessage("Sort by field is required.")
            .isIn(['id', 'created_at', 'updated_at', 'user_id'])
            .withMessage("Sort by must be one of 'id', 'created_at', 'updated_at', or 'user_id'."),

        body("order")
            .optional()
            .isString()
            .toLowerCase()
            .isIn(['asc', 'desc'])
            .withMessage("Order must be either 'ASC' or 'DESC'."),

        body("search")
            .optional()
            .custom(value => {
                if (typeof value !== 'string' && typeof value !== 'number') {
                    throw new Error("Search must be a valid string or number.");
                }
                return true;
            }),

        body("search_field")
            .optional()
            .isString()
            .trim()
            .escape()
            .isIn(['comment', 'user_id'])
            .withMessage("Search field must be either 'comment' or 'user_id'.")
    ])(req, res, next);
};


module.exports = {
    createCommentValidation,
    updateCommentValidation,
    deleteCommentValidation,
    viewCommentValidation,
    getCommentsValidation,
    paginateCommentsValidation
};
