function parseLLMResponse(text) {
  try {
    if (!text) {
      throw new Error("Empty AI response");
    }

    // Agar object already hai
    if (typeof text === "object") {
      return text;
    }

    // Markdown remove
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // First JSON parse
    let parsed = JSON.parse(cleaned);

    // Agar parsed khud ek JSON string hai
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    return parsed;
  } catch (err) {
    console.error("JSON Parse Error:", err);

    return {
      body: "Hi! Vera has a new business recommendation for you.",
      cta: "View Insights",
      send_as: "vera",
      rationale: "Fallback parser",
    };
  }
}

module.exports = {
  parseLLMResponse,
};