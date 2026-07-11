const express = require("express");
const router = express.Router();

const contextStore = require("../services/contextStore");
const { generateMessage } = require("../services/geminiService");
const { parseLLMResponse } = require("../utils/jsonParser");
const { buildResearchDigestPrompt } = require("../prompts/researchDigestPrompt");
router.post("/", async (req, res) => {
  const { now, available_triggers } = req.body;

  if (!now || !Array.isArray(available_triggers)) {
    return res.status(400).json({
      error: "Invalid request",
    });
  }

  if (available_triggers.length === 0) {
    return res.status(200).json({
      actions: [],
    });
  }

  const triggerId = available_triggers[0];

  const triggerData = contextStore.triggers.get(triggerId);


  if (!triggerData) {
    return res.status(200).json({
      actions: [],
    });
  }

  const trigger = triggerData.payload;

  // ==========================
  // Load Merchant Context
  // ==========================


  const merchantData = contextStore.merchants.get(trigger.merchant_id);


  if (!merchantData) {
    return res.status(200).json({
      actions: [],
    });
  }

  const merchant = merchantData.payload;

  // ==========================
  // Load Category Context
  // ==========================
  const categoryData = contextStore.categories.get(
    merchant.category_slug
  );


  const category = categoryData ? categoryData.payload : {};

  // ==========================
  // Load Customer Context
  // ==========================
  let customer = {};

  if (trigger.customer_id) {
    const customerData = contextStore.customers.get(
      trigger.customer_id
    );

    if (customerData) {
      customer = customerData.payload;
    }
  }

 // Build AI Prompt
const prompt = buildResearchDigestPrompt({
  merchant,
  category,
  customer,
  trigger,
});

let parsed = {
  body: `Hi ${merchant?.identity?.owner_first_name || "there"}, here's a new business insight from Vera to help grow your business.`,
  cta: "View Insights",
  send_as: "vera",
  rationale: "Fallback response because AI generation failed.",
};

try {
  const aiResponse = await generateMessage(prompt);

  if (aiResponse) {
    parsed = parseLLMResponse(aiResponse);
    if (!parsed || !parsed.body) {
    parsed = {
    body: `Hi ${merchant?.identity?.owner_first_name || "there"}, here's a new business insight from Vera.`,
    cta: "View Insights",
    send_as: "vera",
    rationale: "Fallback because AI returned invalid JSON.",
      };
    }
  }
} catch (err) {
  console.error("AI Generation Error:", err);
}

  const conversationId = `conv_${triggerId}`;

  return res.status(200).json({
    actions: [
      {
        conversation_id: conversationId,

        merchant_id: trigger.merchant_id,

        customer_id: trigger.customer_id || null,

        send_as: parsed.send_as || (
          trigger.customer_id
            ? "merchant_on_behalf"
            : "vera"
),

        trigger_id: triggerId,

        template_name: "vera_default_v1",

        template_params: [],

        body: parsed.body,

        cta: parsed.cta,

        suppression_key:
          trigger.suppression_key || `sup_${triggerId}`,

        rationale: parsed.rationale,
      },
    ],
  });
});

module.exports = router;