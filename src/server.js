const express = require("express");
const cors = require("cors");
require("dotenv").config();
const contextRoute = require("./routes/context");
const tickRoute = require("./routes/tick");
const replyRoute = require("./routes/reply");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/v1/context", contextRoute);
app.use("/v1/tick", tickRoute);
app.use("/v1/reply", replyRoute);
// Health Check
app.get("/v1/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime_seconds: Math.floor(process.uptime()),
    contexts_loaded: {
    category: contextStore.categories.size,
    merchant: contextStore.merchants.size,
    customer: contextStore.customers.size,
    trigger: contextStore.triggers.size,
    },
  });
});

// Metadata
app.get("/v1/metadata", (req, res) => {
  res.status(200).json({
    team_name: "Deepak",
    team_members: ["Deepak Kumar"],
    model: "Gemini 3.5 Flash",
    approach: "LLM + Rule Engine",
    contact_email: "deepaksharma2004kotala@gmail.com",
    version: "1.0.0",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Vera Bot running on port ${PORT}`);
});