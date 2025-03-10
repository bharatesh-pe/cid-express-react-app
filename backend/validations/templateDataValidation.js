const { body } = require('express-validator');
const { Validate } = require('../middleware/validationMiddleware');



const insertDataValidation = (req, res, next) => {
    return Validate([
        body("table_name").isString().escape().trim().exists()
            .notEmpty().withMessage("table name field is required."),
        // body("data")
        //     .exists()
        //     .withMessage("data field is required.")
        //     .bail() // If previous validation fails, stop here
        //     .custom(value => {
        //         console.log(typeof value)
        //         if (typeof value !== 'object' || value === null) {
        //             throw new Error("data must be a JSON object.");
        //         }
        //         return true;
        //     })
    ])(req, res, next);
};

const updateDataValidation = (req, res, next) => {
    return Validate([
        body("table_name", "table name can not be empty").isString().escape().trim().exists()
            .notEmpty().withMessage("table name field is required."),
        body("data")
            .exists()
            .withMessage("data filed is required.")
            .bail() // If previous validation fails, stop here
            .custom(value => {
                if (typeof value !== 'object' || value === null) {
                    throw new Error("data must be a JSON object.");
                }

                return true;
            }),
        body("where")
            .exists()
            .withMessage("where field is required.")
            .bail() // If previous validation fails, stop here
            .custom(value => {
                if (typeof value !== 'object' || value === null) {
                    throw new Error("where must be a JSON object.");
                }

                return true;
            })
    ])(req, res, next);
};

const gwtDataValidation = (req, res, next) => {
    return Validate([
        body("table_name", "table name field is required.").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};




const paginateDataValidation = (req, res, next) => {
    return Validate([
        body("table_name", "Table name is required and must be a string.")
            .isString()
            .trim()
            .escape()
            .exists()
            .notEmpty()
            .withMessage("table name field is required."),

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

module.exports = {

    insertDataValidation,
    updateDataValidation,
    gwtDataValidation,
    paginateDataValidation
}