const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const JobsModel = require('../Jobs/jobs.model');

let nc;
let js;
let jsm;

const sc = StringCodec();


// ==========================================
// Process Job Result
// ==========================================

const processJobResult = async (msg, agentId) => {

    try {

        const result = JSON.parse(
            sc.decode(msg.data)
        );

        console.log(
            `Received Job Result from ${agentId}:`
        );

        console.log(result);


        const updateResult =
            await JobsModel.updateOne(
                { id: result.jobId },
                {
                    status: result.status,
                    startedAt: result.startedAt,
                    finishedAt: result.finishedAt,
                    duration: result.duration,
                    result: result.result
                }
            );


        console.log(
            'MongoDB update result:',
            updateResult
        );


        if (updateResult.matchedCount === 0) {

            console.log(
                `Job ${result.jobId} was NOT found in MongoDB`
            );

        } else {

            console.log(
                `Job ${result.jobId} updated successfully`
            );

        }


        msg.ack();

    } catch (err) {

        console.error(
            `Failed to process ${agentId} job result:`,
            err
        );

        msg.ack();

    }

};


// ==========================================
// Create Result Consumer
// ==========================================

const createResultConsumer = async (
    streamName,
    durableName,
    filterSubject,
    agentId
) => {

    try {

        await jsm.consumers.add(
            streamName,
            {
                durable_name: durableName,
                filter_subject: filterSubject,
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );

        console.log(
            `${agentId} results consumer created`
        );

    } catch (err) {

        console.log(
            `${agentId} results consumer already exists`
        );

    }


    const consumer =
        await js.consumers.get(
            streamName,
            durableName
        );


    const messages =
        await consumer.consume();


    (async () => {

        for await (const msg of messages) {

            await processJobResult(
                msg,
                agentId
            );

        }

    })();

};


// ==========================================
// Create Job Status Consumer
// ==========================================

const createJobStatusConsumer = async () => {

    try {

        await jsm.consumers.add(
            'JOB_STATUS',
            {
                durable_name: 'central-job-status',
                filter_subject: 'job.status',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.New
            }
        );

        console.log(
            'Job status consumer created'
        );

    } catch (err) {

        console.log(
            'Job status consumer already exists'
        );

    }


    const statusConsumer =
        await js.consumers.get(
            'JOB_STATUS',
            'central-job-status'
        );


    const statusMessages =
        await statusConsumer.consume();


    (async () => {

        for await (const msg of statusMessages) {

            try {

                const statusUpdate =
                    JSON.parse(
                        sc.decode(msg.data)
                    );


                console.log(
                    'Received Job Status:'
                );

                console.log(
                    statusUpdate
                );


                const updateResult =
                    await JobsModel.updateOne(
                        {
                            id: statusUpdate.jobId,
                            status: 'PENDING'
                        },
                        {
                            $set: {
                                status: statusUpdate.status
                            }
                        }
                    );


                console.log(
                    'Job status update result:',
                    updateResult
                );


                if (
                    updateResult.matchedCount === 0
                ) {

                    console.log(
                        `Job ${statusUpdate.jobId} was NOT found in MongoDB`
                    );

                } else {

                    console.log(
                        `Job ${statusUpdate.jobId} status updated to ${statusUpdate.status}`
                    );

                }


                msg.ack();

            } catch (err) {

                console.error(
                    'Failed to process job status:',
                    err
                );

                msg.ack();

            }

        }

    })();

};


// ==========================================
// Create HELLO Consumer
// ==========================================

const createHelloConsumer = async () => {

    try {

        await jsm.consumers.add(
            'HELLO',
            {
                durable_name: 'central',
                filter_subject: 'hello.central',
                ack_policy: AckPolicy.Explicit,
                deliver_policy: DeliverPolicy.All
            }
        );

        console.log(
            'Hello consumer created'
        );

    } catch {

        console.log(
            'Hello consumer already exists'
        );

    }


    const helloConsumer =
        await js.consumers.get(
            'HELLO',
            'central'
        );


    const helloMessages =
        await helloConsumer.consume();


    (async () => {

        for await (const msg of helloMessages) {

            console.log(
                `Central heard: ${sc.decode(msg.data)}`
            );

            msg.ack();

        }

    })();

};


// ==========================================
// Connect Central to NATS
// ==========================================

const connectNats = async () => {

    try {

        nc = await connect({
            servers: 'nats://localhost:4222'
        });


        js = nc.jetstream();

        jsm = await nc.jetstreamManager();


        console.log(
            'Central connected to NATS'
        );


        // ==========================================
        // JOB STATUS
        // ==========================================

        await createJobStatusConsumer();


        // ==========================================
        // HELLO
        // ==========================================

        await createHelloConsumer();


        // ==========================================
        // AGENT 1 RESULTS
        // ==========================================

        await createResultConsumer(
            'RESULTS',
            'central-results-agent-1',
            'results.agent-1',
            'Agent 1'
        );


        // ==========================================
        // AGENT 2 RESULTS
        // ==========================================

        await createResultConsumer(
            'RESULTS',
            'central-results-agent-2',
            'results.agent-2',
            'Agent 2'
        );


        // ==========================================
        // Send Hello to Agent 1
        // ==========================================

        await js.publish(
            'hello.agent-1',
            sc.encode(
                'Hello Agent 1'
            )
        );


        console.log(
            'Hello message sent to Agent 1'
        );


        // ==========================================
        // Send Hello to Agent 2
        // ==========================================

        await js.publish(
            'hello.agent-2',
            sc.encode(
                'Hello Agent 2'
            )
        );


        console.log(
            'Hello message sent to Agent 2'
        );


    } catch (err) {

        console.error(
            'Central NATS connection error:',
            err
        );

        throw err;

    }

};


// ==========================================
// Publish Message
// ==========================================

const publish = async (
    subject,
    data
) => {

    if (!js) {

        throw new Error(
            'NATS is not connected'
        );

    }


    await js.publish(
        subject,
        sc.encode(
            JSON.stringify(data)
        )
    );

};


// ==========================================
// Export
// ==========================================

module.exports = {
    connectNats,
    publish
};