const { BadRequestError } = require('../helpers/APIErros');

// A middleware function that can be used to validate request body against a schema
const SchemaValidatorMiddleware = (schema, options = {
    abortEarly:   false,
    stripUnknown: true
}) => async (req, res, next) => {
    try {
        req.body = await schema().validate(req.body, options);
    } catch (err) {
        if (err) {
            const validationErrors = err.inner.map((innerErr) => ({
                path:    innerErr.path,
                message: innerErr.errors[0]
            }));
            return next(new BadRequestError(validationErrors));
        }
    }
    return next();
};

module.exports = SchemaValidatorMiddleware;
