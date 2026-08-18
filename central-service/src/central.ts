import express from "express";
import {
  connect,
  StringCodec,
  AckPolicy,
  DeliverPolicy,
} from "nats";

const app = express();
const PORT = 3000;

const nc = await connect({
  servers: "nats://localhost:4222",
});

const sc = StringCodec();
const js = nc.jetstream();
const jsm = await nc.jetstreamManager();

console.log("Central Service connected to NATS");

// Create durable consumer for Central replies
try {
  await jsm.consumers.add("JOBS", {
    durable_name: "central",
    filter_subject: "hello.central",
    ack_policy: AckPolicy.Explicit,
    deliver_policy: DeliverPolicy.All,
  });
} catch {}

// Listen for replies from agents
const consumer = await js.consumers.get("JOBS", "central");
const messages = await consumer.consume();

(async () => {
  for await (const msg of messages) {
    console.log(`Central heard: ${sc.decode(msg.data)}`);
    msg.ack();
  }
})();

app.get("/", (_, res) => {
  res.send("Central Service");
});

app.listen(PORT, async () => {
  console.log(`Central Service is running on port ${PORT}`);

  await js.publish(
    "hello.agent-1",
    sc.encode("Hello Agent 1")
  );

  console.log("Hello stored in JetStream for Agent 1");
});