import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * SoloFraud Rescue AI SDK
 * This is a low-level implementation that bypasses Genkit dependency mismatches.
 * Used exclusively to guarantee 100% uptime for the Hackathon Demo.
 */

// We prioritize the verified API key for the final demo rollout
const GEN_AI_KEY = "AIzaSyA2BXRqtHYJXqDeCm8TQkOcRvMDKvQNWY0";
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

export async function runRescueAI(prompt: string, modelName: string = "gemini-1.5-flash") {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error(`[Rescue AI] Fatal Fallback Failure for ${modelName}:`, error);
    throw error;
  }
}

/**
 * Specifically for the Scam Analyzer JSON output
 */
export async function runRescueAnalysis(message: string) {
  const prompt = `
    Analyze this message for scam risks: "${message}"
    Return your response EXCLUSIVELY as a JSON object with this exact structure:
    {
      "summary": "one sentence high level risk summary",
      "findings": [
        { "icon": "emoji", "label": "finding name", "detail": "finding detail", "severity": "low|medium|high" }
      ],
      "advice": ["array of advice strings"],
      "scamType": "the identified scam type"
    }
  `;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return JSON.parse(response.text());
}
