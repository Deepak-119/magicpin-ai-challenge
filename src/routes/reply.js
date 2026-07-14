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
    const userMessage = message.trim().toLowerCase();

    // Off-topic safety
const offTopicKeywords = [
  "ipl",
  "cricket",
  "football",
  "weather",
  "movie",
  "netflix",
  "politics",
  "election",
  "bitcoin",
  "stock market",
  "news"
];

if (offTopicKeywords.some(keyword => userMessage.includes(keyword))) {
  return res.status(200).json({
    reply: {
      body: "I'm here to help with your business conversations on Magicpin. I can't assist with unrelated topics, but I'd be happy to help with your customers or business.",
      end_conversation: true
    },
  });
}

    // STOP / Unsubscribe handling
    if (
      userMessage === "stop" ||
      userMessage === "unsubscribe" ||
      userMessage.includes("don't message") ||
      userMessage.includes("do not message") ||
      userMessage.includes("remove me")
  ) {
  return res.status(200).json({
    reply: {
      body: "Understood. You won't receive further promotional messages.",
      end_conversation: true,
    },
  });
}
// Auto reply detection
const autoReplies = [
  "ok",
  "okay",
  "thanks",
  "thank you",
  "thx",
  "great",
  "cool",
  "👍"
];

if (autoReplies.includes(userMessage)) {
  return res.status(200).json({
    reply: {
      body: "You're welcome! Let me know if you need anything else.",
      end_conversation: false,
    },
  });
}
// Appointment slot detection
const slotPattern =
  /(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday).*(\d{1,2}(:\d{2})?\s?(am|pm))/i;

if (slotPattern.test(message)) {
  return res.status(200).json({
    reply: {
      body: `Perfect! I've noted your preferred appointment slot. I'll share it with the clinic for confirmation shortly.`,
      end_conversation: false,
    },
  });
}
// Merchant technical support
if (
  from_role === "merchant" &&
  (
    userMessage.includes("x-ray") ||
    userMessage.includes("xray") ||
    userMessage.includes("film") ||
    userMessage.includes("d-speed") ||
    userMessage.includes("sensor") ||
    userMessage.includes("machine")
  )
) {
  return res.status(200).json({
    reply: {
      body: "I can help with that. Could you tell me whether you're using a film-based or digital X-ray system, and what issue you're facing—image quality, processing, or equipment replacement?",
      end_conversation: false,
    },
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