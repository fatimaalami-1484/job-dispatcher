import express from "express";

const app = express();
const PORT = 3002;

app.get("/", (_, res) => {
  res.send("Agent 2");
});

app.listen(PORT, () => {
  console.log(`Agent 2 running on ${PORT}`);
});