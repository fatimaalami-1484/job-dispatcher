class APIError extends Error {
    constructor (status, message) {
        super();
        this.status = status;
        this.message = message;
    }
}

class BadRequestError extends APIError {
    constructor (message = 'درخواست نامعتبر است') {
        super(400, message);
    }
}

class NotFoundError extends APIError {
    constructor (message = 'یافت نشد') {
        super(404, message);
    }
}

class InternalServerError extends APIError {
    constructor (message = 'خطا در سرور رخ داده است‌') {
        super(500, message);
    }
}

class DuplicateRecordError extends APIError {
    constructor (message = 'تکراری است') {
        super(409, message);
    }
}

class TooManyRequestError extends APIError {
    constructor (message = 'تعداد درخواست بیش از حد مجاز است') {
        super(429, message);
    }
}
module.exports = {
    APIError,
    NotFoundError,
    BadRequestError,
    InternalServerError,
    DuplicateRecordError,
    TooManyRequestError
};
