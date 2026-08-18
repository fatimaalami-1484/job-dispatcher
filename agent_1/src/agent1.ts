import express from "express";

const app = express();
const PORT = 3001;

app.get("/", (_, res) => {
  res.send("Agent 1");
});

app.listen(PORT, () => {
  console.log(`Agent 1 running on ${PORT}`);
});