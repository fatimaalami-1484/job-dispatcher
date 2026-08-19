const Tools = require('../../helpers/Tools');
const JobsLogic = require('./jobs.logic');

const createJob = async (req, res, next) => {
    try {
        const context = { body: req.body };

        const { data, message } = await JobsLogic.createJob(context);

        res.status(201).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};

const getJobById = async (req, res, next) => {
    try {
        const context = { params: req.params };

        const { data, message } = await JobsLogic.getJobById(context);

        res.status(200).send(Tools.successResponseGenerator(message, data));
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    createJob,
    getJobById
};