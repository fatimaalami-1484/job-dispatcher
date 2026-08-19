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

// Connect the central server to NATS
const connectNats = async () => {
    nc = await connect({
        servers: 'nats://localhost:4222'
    });

    js = nc.jetstream();
    jsm = await nc.jetstreamManager();

    console.log('Central connected to NATS');

    // Create the durable consumer for Hello messages
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'central',
            filter_subject: 'hello.central',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.All
        });
    } catch {}

    // Listen for replies from agents
    const helloConsumer = await js.consumers.get(
        'HELLO',
        'central'
    );

    const helloMessages = await helloConsumer.consume();

    (async () => {
        for await (const msg of helloMessages) {
            console.log(
                `Central heard: ${sc.decode(msg.data)}`
            );

            msg.ack();
        }
    })();

    // Create the durable consumer for job results
    try {
        await jsm.consumers.add('RESULTS', {
            durable_name: 'central-results',
            filter_subject: 'results.agent-1',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New
        });
    } catch {
        console.log('Results consumer already exists');
    }

    // Listen for job results from Agent 1
    const resultConsumer = await js.consumers.get(
        'RESULTS',
        'central-results'
    );

    const resultMessages = await resultConsumer.consume();

    (async () => {
        for await (const msg of resultMessages) {
            try {
                const result = JSON.parse(
                    sc.decode(msg.data)
                );

                console.log('Received Job Result:');
                console.log(result);

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
                    `Job ${result.jobId} updated successfully`
                );

                msg.ack();
            } catch (err) {
                console.error(
                    'Failed to process job result:',
                    err
                );

                msg.ack();
            }
        }
    })();

    // Send hello messages to agents
    await js.publish(
        'hello.agent-1',
        sc.encode('Hello Agent 1')
    );

    console.log('Hello message sent to Agent 1');

    await js.publish(
        'hello.agent-2',
        sc.encode('Hello Agent 2')
    );

    console.log('Hello message sent to Agent 2');
};

// Publish a message to a NATS subject
const publish = async (subject, data) => {
    await js.publish(
        subject,
        sc.encode(JSON.stringify(data))
    );
};

module.exports = {
    connectNats,
    publish
};