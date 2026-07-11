const express = require("express");
const { generateMessage } = require("../services/geminiService");
const { parseLLMResponse } = require("../utils/jsonParser");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      conversation_id,
      merchant_id,
      customer_id,
      from_role,
      message,
      received_at,
      turn_number,
    } = req.body;

    // Basic validation
    if (!conversation_id || !merchant_id || !from_role || !message) {
      return res.status(400).json({
        error: "Invalid request",
      });
    }

    // Placeholder reply
    const prompt = `
You are Vera, Magicpin's AI assistant.

Continue the conversation naturally.

Merchant ID:
${merchant_id}

Customer ID:
${customer_id}

Message from ${from_role}:
${message}

Return ONLY valid JSON.

{
  "body":"",
  "end_conversation": false
}
`;

let parsed = {
  body: "Thanks! I have received your message.",
  end_conversation: false,
};

try {
  const aiResponse = await generateMessage(prompt);

  if (aiResponse) {
    parsed = parseLLMResponse(aiResponse);
  }

  if (!parsed || !parsed.body) {
    parsed = {
      body: "Thanks! I have received your message.",
      end_conversation: false,
    };
  }
} catch (err) {
  console.error(err);
}

  return res.status(200).json({
  reply: {
    body: parsed.body,
    end_conversation: parsed.end_conversation || false,
    },
   });
   
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;