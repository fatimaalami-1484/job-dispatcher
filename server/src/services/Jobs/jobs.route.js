const router = require('express').Router();

const JobsController = require('./jobs.controller');

router.post(
    '/jobs', 
    JobsController.createJob
);

module.exports = router;