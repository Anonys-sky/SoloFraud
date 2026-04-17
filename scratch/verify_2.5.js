const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to get GEMINI_API_KEY
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\s]+)/);
const apiKey = match ? match[1] : null;

if (!apiKey) {
    console.error("Could not find GEMINI_API_KEY in .env.local");
    process.exit(1);
}

const ai = genkit({
  plugins: [googleAI({ apiKey })],
});

async function verify2026Models() {
  const models = [
    "googleai/gemini-2.5-flash",
    "googleai/gemini-2.5-flash-lite",
    "googleai/gemini-2.5-pro"
  ];

  console.log("--- 🧬 Starting 2026 Model Verification ---");
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const res = await ai.generate({
        model: m,
        prompt: "Respond with 'ACTIVE' if you are online.",
      });
      console.log(`✅ ${m} verified. Response: ${res.text}`);
    } catch (err) {
      console.error(`❌ ${m} error: ${err.message}`);
    }
  }
}

verify2026Models();
