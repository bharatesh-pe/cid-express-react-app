const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');

// const createTemplateValidation = (req, res, next) => {
//     return Validate([
//         // Validate template_name
//         body('template_name')
//             .exists().withMessage('template_name is required.')
//             .isString().withMessage('template_name must be a string.')
//             .notEmpty().withMessage('template_name must not be empty.')
//             .trim()
//             .escape(),

//         // Validate template_type
//         body('template_type')
//             .exists().withMessage('template_type is required.')
//             .isString().withMessage('template_type must be a string.')
//             .notEmpty().withMessage('template_type must not be empty.'),

//         // Validate fields
//         body('fields')
//             .exists().withMessage('fields is required.')
//             .isArray({ min: 1 }).withMessage('fields must be a non-empty array.')
//             .custom((fields) => {
//                 const errors = [];
//                 fields.forEach((field, index) => {
//                     if (!field.name || typeof field.name !== 'string') {
//                         errors.push(`Field at index ${index} is missing "name" or "name" is not a string.`);
//                     } else if (!field.name.match(/^[a-z0-9_]+$/)) {
//                         errors.push(`Field "${field.name}" at index ${index} must be lowercase, can contain underscores and numbers, but no spaces or capital letters.`);
//                     }

//                     if (!field.data_type || typeof field.data_type !== 'string') {
//                         errors.push(`Field "${field.name}" at index ${index} is missing "data_type" or "data_type" is not a string.`);
//                     }

//                     if (field.not_null !== undefined && typeof field.not_null !== 'boolean') {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "not_null" value.`);
//                     }

//                     if (field.index !== undefined && typeof field.index !== 'boolean') {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "index" value.`);
//                     }

//                     if (field.unique !== undefined && typeof field.unique !== 'boolean') {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "unique" value.`);
//                     }

//                     if (field.default_value !== undefined && typeof field.default_value !== 'string' && field.default_value !== null) {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "default_value".`);
//                     }

//                     if (field.max_length !== undefined && typeof field.max_length !== 'number') {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "max_length".`);
//                     }

//                     if (field.min_length !== undefined && typeof field.min_length !== 'number') {
//                         errors.push(`Field "${field.name}" at index ${index} has an invalid "min_length".`);
//                     }
//                 });

//                 if (errors.length > 0) {
//                     throw new Error(errors.join(' '));
//                 }

//                 return true;
//             }),

//         // Validate paranoid
//         body('paranoid')
//             .optional()
//             .isBoolean().withMessage('paranoid must be a boolean.'),
//     ])(req, res, next);
// };

const createTemplateValidation = (req, res, next) => {
    return Validate([
        // Validate template_name
        body('template_name')
            .exists().withMessage('template_name is required.')
            .isString().withMessage('template_name must be a string.')
            .notEmpty().withMessage('template_name must not be empty.')
            .trim()
            .escape()
            .isLength({ max: 45 }).withMessage('template_name must not be more than 45 characters.'),

        // Validate template_type
        // body('template_type')
        //     .exists().withMessage('template_type is required.')
        //     .isString().withMessage('template_type must be a string.')
        //     .notEmpty().withMessage('template_type must not be empty.'),

        // Validate fields
        body('fields')
            .exists().withMessage('fields is required.')
            .isArray({ min: 1 }).withMessage('fields must be a non-empty array.')
            .custom((fields, { req }) => {
                const sections = req.body.sections || [];
                const errors = [];

                fields.forEach((field, index) => {
                    // Check if "section" is required and valid when "sections" is present
                    if (sections.length > 0) {
                        if (!field.section) {
                            errors.push(`Field at index ${index} is missing "section".`);
                        } else if (!sections.includes(field.section)) {
                            errors.push(`Field at index ${index} has an invalid "section" value. Must be one of: ${sections.join(', ')}.`);
                        }
                    }

                    // Validate field name
                    if (!field.name || typeof field.name !== 'string') {
                        errors.push(`Field at index ${index} is missing "name" or "name" is not a string.`);
                    }

                    if (!field.data_type || typeof field.data_type !== 'string') {
                        errors.push(`Field "${field.name}" at index ${index} is missing "data_type" or "data_type" is not a string.`);
                    }

                    if (field.not_null !== undefined && typeof field.not_null !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "not_null" value.`);
                    }

                    if (field.index !== undefined && typeof field.index !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "index" value.`);
                    }

                    if (field.unique !== undefined && typeof field.unique !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "unique" value.`);
                    }

                    if (field.default_value !== undefined && typeof field.default_value !== 'string' && typeof field.default_value !== 'number' && field.default_value !== null) {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "default_value".`);
                    }

                    if (field.max_length !== undefined && typeof field.max_length !== 'number') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "max_length".`);
                    }

                    if (field.min_length !== undefined && typeof field.min_length !== 'number') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "min_length".`);
                    }

                    // Validate data_type
                    if (!field.data_type || typeof field.data_type !== 'string') {
                        errors.push(`Field "${field.name}" at index ${index} is missing "data_type" or "data_type" is not a string.`);
                    }
                });

                if (errors.length > 0) {
                    throw new Error(errors.join(' '));
                }

                return true;
            }),

        // Validate paranoid
        body('paranoid')
            .optional()
            .isBoolean().withMessage('paranoid must be a boolean.'),
    ])(req, res, next);
};

const updateTemplateValidation = (req, res, next) => {
    return Validate([
        // Validate template_name
        // body('template_name')
        //     .exists().withMessage('template_name is required.')
        //     .isString().withMessage('template_name must be a string.')
        //     .notEmpty().withMessage('template_name must not be empty.')
        //     .trim()
        //     .escape(),

        // Validate template_type
        body('template_type')
            .exists().withMessage('template_type is required.')
            .isString().withMessage('template_type must be a string.')
            .notEmpty().withMessage('template_type must not be empty.'),


        body('fields')
            .exists().withMessage('fields is required.')
            .isArray({ min: 1 }).withMessage('fields must be a non-empty array.')
            .custom((fields, { req }) => {
                const sections = req.body.sections || [];
                const errors = [];

                fields.forEach((field, index) => {
                    // Check if "section" is required and valid when "sections" is present
                    if (sections.length > 0) {
                        if (!field.section) {
                            errors.push(`Field at index ${index} is missing "section".`);
                        } else if (!sections.includes(field.section)) {
                            errors.push(`Field at index ${index} has an invalid "section" value. Must be one of: ${sections.join(', ')}.`);
                        }
                    }

                    // Validate field name
                    if (!field.name || typeof field.name !== 'string') {
                        errors.push(`Field at index ${index} is missing "name" or "name" is not a string.`);
                    }

                    if (!field.data_type || typeof field.data_type !== 'string') {
                        errors.push(`Field "${field.name}" at index ${index} is missing "data_type" or "data_type" is not a string.`);
                    }

                    if (field.not_null !== undefined && typeof field.not_null !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "not_null" value.`);
                    }

                    if (field.index !== undefined && typeof field.index !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "index" value.`);
                    }

                    if (field.unique !== undefined && typeof field.unique !== 'boolean') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "unique" value.`);
                    }

                    if (field.default_value !== undefined && typeof field.default_value !== 'string' && typeof field.default_value !== 'number' && field.default_value !== null) {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "default_value".`);
                    }

                    if (field.max_length !== undefined && typeof field.max_length !== 'number') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "max_length".`);
                    }

                    if (field.min_length !== undefined && typeof field.min_length !== 'number') {
                        errors.push(`Field "${field.name}" at index ${index} has an invalid "min_length".`);
                    }

                    // Validate data_type
                    if (!field.data_type || typeof field.data_type !== 'string') {
                        errors.push(`Field "${field.name}" at index ${index} is missing "data_type" or "data_type" is not a string.`);
                    }
                });

                if (errors.length > 0) {
                    throw new Error(errors.join(' '));
                }

                return true;
            }),

        body('paranoid')
            .optional()
            .isBoolean().withMessage('paranoid must be a boolean.'),
    ])(req, res, next);

};

const paginateTemplateValidation = (req, res, next) => {
    return Validate([


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

        body("sortBy")
            .optional()
            .isString()
            .trim()
            .escape()
            .exists()
            .notEmpty()
            .withMessage("sortBy field is required."),
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
            })
    ])(req, res, next);
};

const deleteTemplateValidation = (req, res, next) => {
    return Validate([
        // Validate table_name
        body("table_name")
            .exists({ checkFalsy: true })
            .withMessage("table_name is required")
            .isString()
            .withMessage("table_name must be a string")
            .trim()
            .notEmpty()
            .withMessage("table_name cannot be empty"),
    ])(req, res, next);
};


const viewTemplateValidation = (req, res, next) => {
    return Validate([
        // Validate table_name
        body("table_name")
            .exists({ checkFalsy: true })
            .withMessage("table_name is required")
            .isString()
            .withMessage("table_name must be a string")
            .trim()
            .notEmpty()
            .withMessage("table_name cannot be empty"),
    ])(req, res, next);
};

module.exports = {
    createTemplateValidation,
    updateTemplateValidation,
    paginateTemplateValidation,
    deleteTemplateValidation,
    viewTemplateValidation

}