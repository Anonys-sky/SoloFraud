const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
require('dotenv').config({ path: '.env.local' });

const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

async function testModels() {
  const models = [
    "googleai/gemini-1.5-flash-latest",
    "googleai/gemini-1.5-pro-latest",
    "googleai/gemini-2.0-flash-exp",
    "googleai/gemini-1.5-flash",
    "googleai/gemini-flash-latest"
  ];

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const res = await ai.generate({
        model: m,
        prompt: "Hello, respond with 'OK' if you see this.",
      });
      console.log(`✅ ${m} Success: ${res.text}`);
    } catch (err) {
      console.error(`❌ ${m} Failed: ${err.message}`);
    }
  }
}

testModels();
