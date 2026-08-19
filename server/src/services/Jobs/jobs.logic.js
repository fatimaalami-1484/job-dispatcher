const JobsModel = require('./jobs.model');
const { getNextSequence } = require('../../helpers/Counter');
const { NotFoundError } = require('../../helpers/APIErros');

const createJob = async (context) => {
    const { body } = context;

    if (!body.agentId || !body.fileName || body.timeout == null) {
        throw new Error('اطلاعات جاب ناقص است');
    }

    if (typeof body.timeout !== 'number' || body.timeout <= 0) {
        throw new Error('timeout نامعتبر است');
    }

    const job = {
        id: await getNextSequence('jobs'),
        finishedAt: null,
        agentId: body.agentId,
        fileName: body.fileName,
        timeout: body.timeout,
        status: 'PENDING'
    };

    await JobsModel.insertOne(job);

    return {
        message: 'جاب با موفقیت ایجاد شد',
        data: JobsModel.getResponseObject(job)
    };
};

const getJobById = async (context) => {
    const { params } = context;

    const job = await JobsModel.findOne(
        { id: Number(params.id) },
        { projection: JobsModel.getProjection({}) }
    );

    if (!job) {
        throw new NotFoundError('جاب یافت نشد');
    }

    return {
        message: 'اطلاعات جاب با موفقیت دریافت شد',
        data: JobsModel.getResponseObject(job)
    };
};

module.exports = {
    createJob,
    getJobById
};