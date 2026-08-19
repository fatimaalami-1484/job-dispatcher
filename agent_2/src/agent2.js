const express = require('express');
const { spawn } = require('child_process');
const database = require('../../server/src/database');
const path = require('path');

const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const app = express();
const PORT = 3002;

const JOBS_DIRECTORY = 'D:\\Fatemeh\\PART\\JobMesh\\JobTest';


// Execute Job
const executeJob = (job) => {
    return new Promise((resolve) => {
        const filePath = path.join(
            JOBS_DIRECTORY,
            job.address
        );

        console.log(`Starting Job ${job.jobId}`);
        console.log(`File: ${filePath}`);

        const startedAt = new Date();

        const child = spawn('node', [filePath]);

        let stdout = '';
        let stderr = '';

        let finished = false;


        // Collect stdout
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // Collect stderr
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Job Timeout
        const timeout = setTimeout(() => {
            if (finished) {
                return;
            }
            finished = true;
            child.kill();
            const finishedAt = new Date();

            resolve({
                orderId: job.orderId,
                jobId: job.jobId,
                agentId: job.agentId,

                status: database.enums.STATUS.TIMEOUT,

                startedAt,
                finishedAt,

                duration:
                    finishedAt.getTime() -
                    startedAt.getTime(),

                result: {
                    success: false,
                    stdout,
                    stderr: 'Job execution timed out'
                }
            });
        }, job.timeout * 1000);

        // Process Closed
        child.on('close', (code) => {

            if (finished) {
                return;
            }

            finished = true;
            clearTimeout(timeout);

            const finishedAt = new Date();

            const duration =
                finishedAt.getTime() -
                startedAt.getTime();

            const success = code === 0;

            resolve({
                orderId: job.orderId,
                jobId: job.jobId,
                agentId: job.agentId,

                status: success
                    ? database.enums.STATUS.COMPLETED
                    : database.enums.STATUS.FAILED,

                startedAt,
                finishedAt,
                duration,

                result: {
                    success,
                    stdout,
                    stderr
                }
            });

        });

        // Process Error
        child.on('error', (error) => {

            if (finished) {
                return;
            }

            finished = true;
            clearTimeout(timeout);
            const finishedAt = new Date();

            const duration =
                finishedAt.getTime() -
                startedAt.getTime();

            resolve({
                orderId: job.orderId,
                jobId: job.jobId,
                agentId: job.agentId,

                status: database.enums.STATUS.FAILED,

                startedAt,
                finishedAt,
                duration,

                result: {
                    success: false,
                    stdout,
                    stderr: error.message
                }
            });
        });
    });
};


// Start Agent 2
const startAgent = async () => {

    const nc = await connect({
        servers: 'nats://localhost:4222'
    });
    const sc = StringCodec();
    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();
    console.log('Agent 2 connected to NATS');


    // HELLO Consumer
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'agent-2',
            filter_subject: 'hello.agent-2',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New

        });

    } catch (err) {
        console.log('Hello consumer already exists');
    }

    const helloConsumer =
        await js.consumers.get(
            'HELLO',
            'agent-2'
        );

    const helloMessages =
        await helloConsumer.consume();

    (async () => {

        for await (const msg of helloMessages) {
            const text =
                sc.decode(msg.data);

            console.log(
                `Received from Central: ${text}`
            );

            await js.publish(
                'hello.central',
                sc.encode(
                    'Hello Central Service, I am Agent 2.'
                )
            );

            console.log('Agent 2: "Hello Central Service, I am Agent 2."');

            msg.ack();
        }
    })();

    // JOB Consumer
    try {
        await jsm.consumers.add('ORDERS', {
            durable_name: 'agent-2-orders',
            filter_subject: 'orders.agent-2',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New

        });

    } catch (err) {

        console.log(
            'Job consumer already exists'
        );
    }

    const jobConsumer =
        await js.consumers.get(
            'ORDERS',
            'agent-2-orders'
        );

    const jobMessages =
        await jobConsumer.consume();

    // Listen for Jobs

    (async () => {

        for await (const msg of jobMessages) {
            try {
                const job =
                    JSON.parse(
                        sc.decode(msg.data)
                    );

                console.log('Received Job:');
                console.log(job);

                await js.publish(
                    'orders.received',
                    sc.encode(
                        JSON.stringify({
                            orderId: job.orderId,
                            jobId: job.jobId,
                            agentId: job.agentId
                        })
                    )
                );

                console.log(`Order ${job.orderId} received by Agent 2`);

                // Send RUNNING Status to Central
                await js.publish(
                    'orders.running',
                    sc.encode(
                        JSON.stringify({
                            orderId: job.orderId,
                            jobId: job.jobId,
                            agentId: job.agentId,
                            status: database.enums.STATUS.RUNNING
                        })
                    )
                );

                console.log(`Job ${job.jobId} is now RUNNING`);
                // Execute Job
                const result =
                    await executeJob(job);

                console.log('Job Result:');
                console.log(result);

                // Send Final Result to Central
                await js.publish(
                    'orders.result.agent-2',
                    sc.encode(
                        JSON.stringify(result)
                    )
                );

                console.log(`Job ${job.jobId} result sent to Central`);

                // ACK Job Message
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

    // HTTP Server
    app.get('/', (_, res) => {
        res.send('Agent 2');
    });

    app.listen(PORT, () => {
        console.log(`Agent 2 is running on port ${PORT}`);
    });
};

// Start
startAgent().catch((err) => {
    console.error(
        'Agent 2 failed to start:',
        err
    );
    process.exit(1);

});