const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateMessage(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        },
    });

    
    return response.text;
  } catch (err) {
    console.error("Gemini Error:", err);
    return null;
  }
}

module.exports = {
  generateMessage,
};