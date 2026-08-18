const Logger = require('../helpers/Logger');
const { APIError } = require('../helpers/APIErros');

// A middleware function that handles errors and sends an appropriate response to the client
const ErrorHandlerMiddleware = (err, req, res, next) => {
    Logger.error({
        method:      req.method,
        originalUrl: req.originalUrl,
        status:      err?.status || 500,
        message:     err.message,
        stack:       err?.stack
    });

    // If the error is an instance of APIError (i.e., it's a custom error we defined), send an error response with the specified status code and message
    if (err instanceof APIError) {
        return res.status(err.status).send({ errors: typeof err.message === 'string' ? [ { message: err.message } ] : err.message });
    }

    // If the error is not an instance of APIError, send a generic error response with a 500 status code and message
    return res.status(500).send({ errors: [ { message: 'خطایی رخ داده است. لطفا بعد از چند دقیقه دوباره تلاش کنید' } ] });
};

module.exports = ErrorHandlerMiddleware;
