const successResponseGenerator = (message, data) => ({
    result: {
        message, data
    }
});

module.exports = {
    successResponseGenerator
};