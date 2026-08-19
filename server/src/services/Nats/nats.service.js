const {
    connect,
    StringCodec,
    AckPolicy,
    DeliverPolicy
} = require('nats');

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

    // Create the durable consumer if it does not exist
    try {
        await jsm.consumers.add('HELLO', {
            durable_name: 'central',
            filter_subject: 'hello.central',
            ack_policy: AckPolicy.Explicit,
            deliver_policy: DeliverPolicy.All
        });
    } catch {}

    // Listen for replies from agents
    const consumer = await js.consumers.get('HELLO', 'central');
    const messages = await consumer.consume();

    (async () => {
        for await (const msg of messages) {
            console.log(`Central heard: ${sc.decode(msg.data)}`);
            msg.ack();
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