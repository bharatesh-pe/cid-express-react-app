
const { validationResult } = require("express-validator");

const Validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
        }, {});

        res.status(400).json({
            errors: formattedErrors,
            message: "The given data was invalid",
        });
    };
};

module.exports = {
    Validate,
};
