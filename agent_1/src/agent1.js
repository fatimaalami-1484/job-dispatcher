const express = require('express');

const { spawn } = require('child_process');
const path = require('path');

const JOBS_DIRECTORY = 'D:\\Fatemeh\\PART\\JobMesh\\JobTest';

const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const app = express();
const PORT = 3001;


// ==========================================
// Execute Job
// ==========================================

const executeJob = (job) => {

    return new Promise((resolve) => {

        const filePath =
            path.join(
                JOBS_DIRECTORY,
                job.fileName
            );

        const startedAt = new Date();

        console.log(
            `Starting Job ${job.jobId}`
        );

        console.log(
            `File: ${filePath}`
        );


        const child =
            spawn(
                'node',
                [filePath]
            );


        let stdout = '';
        let stderr = '';


        // ==========================================
        // STDOUT
        // ==========================================

        child.stdout.on(
            'data',
            (data) => {

                stdout +=
                    data.toString();

            }
        );


        // ==========================================
        // STDERR
        // ==========================================

        child.stderr.on(
            'data',
            (data) => {

                stderr +=
                    data.toString();

            }
        );


        // ==========================================
        // TIMEOUT
        // ==========================================

        const timeout =
            setTimeout(
                () => {

                    console.log(
                        `Job ${job.jobId} timed out`
                    );


                    child.kill();


                    const finishedAt =
                        new Date();


                    resolve({

                        jobId:
                            job.jobId,

                        agentId:
                            job.agentId,

                        status:
                            'TIMEOUT',

                        startedAt:
                            startedAt,

                        finishedAt:
                            finishedAt,

                        duration:
                            finishedAt -
                            startedAt,

                        result: {

                            success:
                                false,

                            stdout:
                                stdout,

                            stderr:
                                stderr ||
                                'Job execution timed out'

                        }

                    });

                },
                job.timeout * 1000
            );


        // ==========================================
        // PROCESS CLOSE
        // ==========================================

        child.on(
            'close',
            (code) => {

                clearTimeout(timeout);


                const finishedAt =
                    new Date();


                const success =
                    code === 0;


                resolve({

                    jobId:
                        job.jobId,

                    agentId:
                        job.agentId,

                    status:
                        success
                            ? 'COMPLETED'
                            : 'FAILED',

                    startedAt:
                        startedAt,

                    finishedAt:
                        finishedAt,

                    duration:
                        finishedAt -
                        startedAt,

                    result: {

                        success:
                            success,

                        stdout:
                            stdout,

                        stderr:
                            stderr

                    }

                });

            }
        );


        // ==========================================
        // PROCESS ERROR
        // ==========================================

        child.on(
            'error',
            (error) => {

                clearTimeout(timeout);


                const finishedAt =
                    new Date();


                resolve({

                    jobId:
                        job.jobId,

                    agentId:
                        job.agentId,

                    status:
                        'FAILED',

                    startedAt:
                        startedAt,

                    finishedAt:
                        finishedAt,

                    duration:
                        finishedAt -
                        startedAt,

                    result: {

                        success:
                            false,

                        stdout:
                            stdout,

                        stderr:
                            error.message

                    }

                });

            }
        );

    });

};


// ==========================================
// Start Agent 1
// ==========================================

const startAgent = async () => {

    const nc =
        await connect({
            servers:
                'nats://localhost:4222'
        });


    const sc =
        StringCodec();


    const js =
        nc.jetstream();


    const jsm =
        await nc.jetstreamManager();


    console.log(
        'Agent 1 connected to NATS'
    );


    // ==========================================
    // HELLO Consumer
    // ==========================================

    try {

        await jsm.consumers.add(
            'HELLO',
            {

                durable_name:
                    'agent-1',

                filter_subject:
                    'hello.agent-1',

                ack_policy:
                    AckPolicy.Explicit,

                deliver_policy:
                    DeliverPolicy.New

            }
        );

    } catch (err) {

        console.log(
            'Hello consumer already exists'
        );

    }


    // ==========================================
    // Listen for Hello Messages
    // ==========================================

    const helloConsumer =
        await js.consumers.get(
            'HELLO',
            'agent-1'
        );


    const helloMessages =
        await helloConsumer.consume();


    (async () => {

        for await (
            const msg of helloMessages
        ) {

            try {

                const text =
                    sc.decode(
                        msg.data
                    );


                console.log(
                    `Received from Central: ${text}`
                );


                await js.publish(
                    'hello.central',
                    sc.encode(
                        'Hello Central Service, I am Agent 1.'
                    )
                );


                console.log(
                    'Agent 1: "Hello Central Service, I am Agent 1."'
                );


                msg.ack();

            } catch (err) {

                console.error(
                    'Hello message failed:',
                    err
                );

                msg.ack();

            }

        }

    })();


    // ==========================================
    // JOB Consumer
    // ==========================================

    try {

        await jsm.consumers.add(
            'JOBS',
            {

                durable_name:
                    'agent-1-jobs',

                filter_subject:
                    'jobs.agent-1',

                ack_policy:
                    AckPolicy.Explicit,

                deliver_policy:
                    DeliverPolicy.New

            }
        );

    } catch (err) {

        console.log(
            'Job consumer already exists'
        );

    }


    // ==========================================
    // Get Job Consumer
    // ==========================================

    const jobConsumer =
        await js.consumers.get(
            'JOBS',
            'agent-1-jobs'
        );


    const jobMessages =
        await jobConsumer.consume();


    // ==========================================
    // Listen for Jobs
    // ==========================================

    (async () => {

        for await (
            const msg of jobMessages
        ) {

            try {

                const job =
                    JSON.parse(
                        sc.decode(
                            msg.data
                        )
                    );


                console.log(
                    'Received Job:'
                );

                console.log(
                    job
                );


                // ==========================================
                // SEND RUNNING STATUS
                // ==========================================

                const runningStatus = {

                    jobId:
                        job.jobId,

                    agentId:
                        job.agentId,

                    status:
                        'RUNNING'

                };


                await js.publish(
                    'job.status',
                    sc.encode(
                        JSON.stringify(
                            runningStatus
                        )
                    )
                );


                console.log(
                    `Job ${job.jobId} status sent: RUNNING`
                );


                // ==========================================
                // EXECUTE JOB
                // ==========================================

                const result =
                    await executeJob(
                        job
                    );


                console.log(
                    'Job Result:'
                );

                console.log(
                    result
                );


                // ==========================================
                // SEND FINAL RESULT
                // ==========================================

                await js.publish(
                    'results.agent-1',
                    sc.encode(
                        JSON.stringify(
                            result
                        )
                    )
                );


                console.log(
                    'Job result sent to Central'
                );


                // ==========================================
                // ACK JOB MESSAGE
                // ==========================================

                msg.ack();

            } catch (err) {

                console.error(
                    'Job execution failed:',
                    err
                );


                msg.ack();

            }

        }

    })();


    // ==========================================
    // HTTP SERVER
    // ==========================================

    app.get(
        '/',
        (_, res) => {

            res.send(
                'Agent 1'
            );

        }
    );


    app.listen(
        PORT,
        () => {

            console.log(
                `Agent 1 is running on port ${PORT}`
            );

        }
    );

};


// ==========================================
// START
// ==========================================

startAgent().catch(
    (err) => {

        console.error(
            'Agent 1 failed to start:',
            err
        );

        process.exit(1);

    }
);