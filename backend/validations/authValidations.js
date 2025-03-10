const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');

const adminLoginValidation = (req, res, next) => {
    return Validate([
        // Validate admin_user_token_id
        body('admin_user_token_id')
            .exists().withMessage('admin_user_token_id is required.')
            .isString().withMessage('admin_user_token_id must be a string.')
            .notEmpty().withMessage('admin_user_token_id must not be empty.')
            .trim(),
    ])(req, res, next);
};

const LoginValidation = (req, res, next) => {
    return Validate([
        // Validate admin_user_token_id
        body('token_id')
            .exists().withMessage('token_id is required.')
            .isString().withMessage('token_id must be a string.')
            .notEmpty().withMessage('token_id must not be empty.')
            .trim(),
    ])(req, res, next);
};

const encryptAdminUserTokenIdValidation = (req, res, next) => {
    return Validate([
        // Validate admin_user_token_id
        body('admin_user_token_id')
            .exists().withMessage('admin_user_token_id is required.')
            .isInt().withMessage('admin_user_token_id must be a number.') // Ensures it's an integer
            .notEmpty().withMessage('admin_user_token_id must not be empty.'),
    ])(req, res, next);
};


const encryptUserTokenIdValidation = (req, res, next) => {
    return Validate([
        // Validate user_token_id
        body('user_token_id')
            .exists().withMessage('user_token_id is required.')
            .isInt().withMessage('user_token_id must be a number.') // Ensures it's an integer
            .notEmpty().withMessage('user_token_id must not be empty.'),
    ])(req, res, next);
};


const userLoginValidation = (req, res, next) => {
    return Validate([
        // Validate user_token_id
        body('user_token_id')
            .exists().withMessage('user_token_id is required.') // Ensures the field exists
            .isString().withMessage('user_token_id must be a string.') // Ensures it's a string
            .notEmpty().withMessage('user_token_id must not be empty.'), // Ensures it's not empty
    ])(req, res, next);
};



module.exports = {
    adminLoginValidation,
    encryptAdminUserTokenIdValidation,
    encryptUserTokenIdValidation,
    userLoginValidation,
    LoginValidation
};
