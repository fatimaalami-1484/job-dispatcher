const BodySchemaCastingMiddleware = (schema, options = {
    assert: false,
    abortEarly: false,
    stripUnknown: true
}) => async (req, res, next) => {

    req.body = await schema().cast(req.body, options);

    return next();
};

module.exports = BodySchemaCastingMiddleware;