const router = require('express').Router();
const JobsController = require('./jobs.controller');

router.get(
    '/jobs',
    JobsController.getJobs
);

module.exports = router;