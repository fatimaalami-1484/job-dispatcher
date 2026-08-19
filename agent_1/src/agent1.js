const express = require('express');
const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const app = express();
const PORT = 3001;

// Start Agent 1
const startAgent = async () => {
    const nc = await connect({
        servers: 'nats://localhost:4222'
    });

    const sc = StringCodec();
    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    console.log('Agent 1 connected to NATS');

    // Create consumer for Hello messages
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'agent-1',
            filter_subject: 'hello.agent-1',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New
        });
    } catch (err) {
        console.log('Hello consumer already exists');
    }

    // Listen for Hello messages
    const helloConsumer = await js.consumers.get('HELLO', 'agent-1');
    const helloMessages = await helloConsumer.consume();

    (async () => {
        for await (const msg of helloMessages) {
            const text = sc.decode(msg.data);

            console.log(`Received from Central: ${text}`);

            await js.publish(
                'hello.central',
                sc.encode('Hello Central Service, I am Agent 1.')
            );

            console.log('Agent 1: "Hello Central Service, I am Agent 1."');

            msg.ack();
        }
    })();

    // Create consumer for Job messages
    try {
        await jsm.consumers.add('JOBS', {
            durable_name: 'agent-1-jobs',
            filter_subject: 'jobs.agent-1',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New
        });
    } catch (err) {
        console.log('Job consumer already exists');
    }

    // Listen for Job messages
    const jobConsumer = await js.consumers.get(
        'JOBS',
        'agent-1-jobs'
    );

    const jobMessages = await jobConsumer.consume();

    (async () => {
        for await (const msg of jobMessages) {
            try {
                const job = JSON.parse(sc.decode(msg.data));

                console.log('Received Job:');
                console.log(job);

                msg.ack();
            } catch (err) {
                console.error('Invalid Job message:', err);
                msg.ack();
            }
        }
    })();

    app.get('/', (_, res) => {
        res.send('Agent 1');
    });

    app.listen(PORT, () => {
        console.log(`Agent 1 is running on port ${PORT}`);
    });
};

startAgent().catch((err) => {
    console.error('Agent 1 failed to start:', err);
    process.exit(1);
});