import express from "express";
import { connect, StringCodec } from "nats";

const app = express();
const PORT = 3000;

const nc = await connect({
  servers: "nats://localhost:4222",
});

const sc = StringCodec();

console.log("Central Service connected to NATS");

// Listen for agent responses
const replySub = nc.subscribe("hello.central");

(async () => {
  for await (const msg of replySub) {
    console.log(`Central heard: ${sc.decode(msg.data)}`);
  }
})();

app.get("/", (_, res) => {
  res.send("Central Service");
});

app.listen(PORT, () => {
  console.log(`Central Service is running on port ${PORT}`);

  // Send a greeting to Agent 1 after startup
  setTimeout(() => {
    nc.publish("hello.agent1", sc.encode("Hello Agent 1"));
    console.log("Greeting sent to Agent 1");
  }, 2000);
});