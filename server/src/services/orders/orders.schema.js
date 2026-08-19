const Yup = require('yup');

const createOrderSchema = () =>
    Yup.object().shape({
        jobId: Yup.string()
            .required('انتخاب جاب الزامی است'),
        agentId: Yup.string()
            .required('انتخاب ایجنت الزامی است'),
        timeout: Yup.number()
            .required('انتخاب زمان الزامی است'),
    });

module.exports = {
    createOrderSchema
};