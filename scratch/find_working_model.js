const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=([^\s]+)/)[1];

const ai = genkit({
  plugins: [googleAI({ apiKey })],
});

async function discoverWorkingModel() {
  // Broad list of possible 2026 models including experimental and legacy aliases
  const candidates = [
    "googleai/gemini-2.5-flash",
    "googleai/gemini-2.5-flash-lite",
    "googleai/gemini-2.5-pro",
    "googleai/gemini-2.0-flash",
    "googleai/gemini-2.0-pro",
    "googleai/gemini-3-flash-preview",
    "googleai/gemini-flash-latest"
  ];

  console.log("--- 🕵️ Searching for a WORKING Gemini model ---");
  for (const m of candidates) {
    try {
      console.log(`[Test] ${m}...`);
      const res = await ai.generate({
        model: m,
        prompt: "Respond with 'READY'.",
        config: { requestTimeout: 10000 }
      });
      console.log(`✨ FOUND WORKING MODEL: ${m} -> ${res.text}`);
      return m;
    } catch (err) {
      console.error(`❌ ${m} failed: ${err.message.substring(0, 100)}...`);
    }
  }
}

discoverWorkingModel();
