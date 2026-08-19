const express = require('express');
const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

const app = express();
const PORT = 3001;

// Start the agent
const startAgent = async () => {
    const nc = await connect({
        servers: 'nats://localhost:4222'
    });

    const sc = StringCodec();
    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    console.log('Agent 1 connected to NATS');

    // Create the durable consumer
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'agent-1',
            filter_subject: 'hello.agent-1',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.New
        });
    } catch (err) {
        console.log('Consumer already exists:', err.message);
    }

    // Listen for Hello messages
    const consumer = await js.consumers.get('HELLO', 'agent-1');
    const messages = await consumer.consume();

    (async () => {
        for await (const msg of messages) {
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