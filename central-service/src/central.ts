import express from "express";
import { connect } from "nats";

const app = express();
const PORT = 3000;

// اتصال به NATS
const nc = await connect({
  servers: "nats://localhost:4222",
});

console.log("🟦 Central connected to NATS");

app.get("/", (_, res) => {
  res.send("Central Service");
});

app.listen(PORT, () => {
  console.log(`Central Service running on ${PORT}`);
});