const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');


const addFieldValidation = (req, res, next) => {
    return Validate([
        // Validate field_name
        body('field_name')
            .exists().withMessage('field_name is required.') // Ensures the field exists
            .isString().withMessage('field_name must be a string.') // Ensures it's a string
            .notEmpty().withMessage('field_name must not be empty.'), // Ensures it's not empty

        // Validate json object
        body('json')
            .exists().withMessage('json is required.') // Ensures the field exists
            .isObject().withMessage('json must be an object.'), // Ensures it's an object

        // // Validate specific fields inside json
        body('json.required')
            .optional() // Optional field
            .isBoolean().withMessage('required must be a boolean.'),

        body('json.disabled')
            .optional()
            .isBoolean().withMessage('disabled must be a boolean.'),

        body('json.label')
            .optional()
            .isString().withMessage('label must be a string.'),

        body('json.kannada')
            .optional()
            .isString().withMessage('kannada must be a string.'),

        body('json.heading')
            .optional()
            .isString().withMessage('heading must be a string.'),

        body('json.supportingText')
            .optional()
            .isString().withMessage('supportingText must be a string.'),

        body('json.info')
            .optional()
            .isString().withMessage('info must be a string.'),

        body('json.history')
            .optional()
            .isString().withMessage('history must be a string.'),

        body('json.minLength')
            .optional()
            .isInt({ min: 1 }).withMessage('minLength must be an integer greater than 0.'),

        body('json.maxLength')
            .optional()
            .isInt({ min: 1 }).withMessage('maxLength must be an integer greater than 0.'),

        body('json.numeric')
            .optional()
            .isBoolean().withMessage('numeric must be a boolean.'),

        body('json.type')
            .optional()
            .isString().withMessage('type must be a string.'),

        body('json.name')
            .optional()
            .isString().withMessage('name must be a string.'),

        body('json.placeholder')
            .optional()
            .isString().withMessage('placeholder must be a string.'),

        body('json.formType')
            .optional()
            .isString().withMessage('formType must be a string.'),
    ])(req, res, next);
};


const updateFieldValidation = (req, res, next) => {
    return Validate([
        // Validate field_id
        body('field_id')
            .exists().withMessage('field_id is required.') // Ensures the field exists
            .isInt().withMessage('field_id must be a number.') // Ensures it's an integer
            .notEmpty().withMessage('field_id must not be empty.'), // Ensures it's not empty

        // Validate field_name
        body('field_name')
            .optional() // Optional field
            .isString().withMessage('field_name must be a string.'),

        // Validate json object
        body('json')
            .optional() // Optional field
            .isObject().withMessage('json must be an object.'),

        // Validate specific fields inside json
        body('json.required')
            .optional()
            .isBoolean().withMessage('required must be a boolean.'),

        body('json.disabled')
            .optional()
            .isBoolean().withMessage('disabled must be a boolean.'),

        body('json.label')
            .optional()
            .isString().withMessage('label must be a string.'),

        body('json.kannada')
            .optional()
            .isString().withMessage('kannada must be a string.'),

        body('json.heading')
            .optional()
            .isString().withMessage('heading must be a string.'),

        body('json.supportingText')
            .optional()
            .isString().withMessage('supportingText must be a string.'),

        body('json.info')
            .optional()
            .isString().withMessage('info must be a string.'),

        body('json.history')
            .optional()
            .isString().withMessage('history must be a string.'),

        body('json.minLength')
            .optional()
            .isInt({ min: 1 }).withMessage('minLength must be an integer greater than 0.'),

        body('json.maxLength')
            .optional()
            .isInt({ min: 1 }).withMessage('maxLength must be an integer greater than 0.'),

        body('json.numeric')
            .isBoolean().withMessage('numeric must be a boolean.')
            .optional(),

        body('json.type')
            .optional()
            .isString().withMessage('type must be a string.'),

        body('json.name')
            .optional()
            .isString().withMessage('name must be a string.'),

        body('json.placeholder')
            .optional()
            .isString().withMessage('placeholder must be a string.'),

        body('json.formType')
            .optional()
            .isString().withMessage('formType must be a string.'),
    ])(req, res, next);
};


const deleteFieldValidation = (req, res, next) => {
    return Validate([
        // Validate field_id
        body('field_id')
            .exists().withMessage('field_id is required.') // Ensures field_id exists
            .isInt().withMessage('field_id must be a valid integer.') // Ensures it's an integer
            .notEmpty().withMessage('field_id must not be empty.') // Ensures it's not empty
    ])(req, res, next);
};


const viewFieldValidation = (req, res, next) => {
    return Validate([
        // Validate field_id
        body('field_id')
            .exists().withMessage('field_id is required.') // Ensures field_id exists
            .isInt().withMessage('field_id must be a valid integer.') // Ensures it's an integer
            .notEmpty().withMessage('field_id must not be empty.') // Ensures it's not empty
    ])(req, res, next);
};


const paginateFieldsValidation = (req, res, next) => {
    return Validate([
        // Validate page (optional, defaults to 1)
        body("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be an integer greater than or equal to 1."),

        // Validate limit (optional, defaults to 10)
        body("limit")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Limit must be an integer greater than or equal to 1."),

        // Validate sortBy (optional, defaults to created_at)
        body("sortBy")
            .optional()
            .isString()
            .withMessage("sortBy must be a valid string."),

        // Validate order (optional, defaults to asc)
        body("order")
            .optional()
            .isString()
            .isIn(["asc", "desc"])
            .withMessage("Order must be either 'asc' or 'desc'."),

        // Validate search (optional)
        body("search")
            .optional()
            .isString()
            .withMessage("Search must be a valid string."),
    ])(req, res, next);
};


module.exports = {
    addFieldValidation,
    updateFieldValidation,
    deleteFieldValidation,
    viewFieldValidation,
    paginateFieldsValidation
};