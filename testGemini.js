require("dotenv").config();

const { generateMessage } = require("./src/services/geminiService");

(async () => {
  const response = await generateMessage(
    "Reply in exactly one sentence: Say hello to Deepak."
  );

  console.log(response);
})();