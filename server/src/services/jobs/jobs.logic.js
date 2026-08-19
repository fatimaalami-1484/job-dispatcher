const JobsModel = require('./jobs.model');
// const { NotFoundError } = require('../../helpers/APIErros');
// const NatsService = require('../Nats/nats.service');

// Get available jobs
const getJobs = async () => {
    const { items: jobs, totalItems } = await JobsModel.find({ filter: {} });

    return {
        message: 'دریافت اطلاعات سفارش ها با موفقیت انجام شد',
        data: {
            data: {
                jobs,
                totalItems
            }
        }
    };
};

module.exports = {
    getJobs,
};