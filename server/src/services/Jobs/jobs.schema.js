const Yup = require('yup');

const createJobSchema = () =>
    Yup.object().shape({
        agentId: Yup.string().required(),
        fileName: Yup.string().required(),
        timeout: Yup.number().integer().positive().required()
    });

module.exports = {
    createJobSchema
};