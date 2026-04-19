import { GoogleGenAI } from "@google/genai";

/**
 * SoloFraud Rescue AI SDK - Vertex API Key Edition
 * Ported directly from the Hackathon Python configuration.
 */

const GEN_AI_KEY = process.env.GEMINI_API_KEY as string;

// The new unified SDK natively supports Vertex AI Express keys (AQ...)
const ai = new GoogleGenAI({
  vertexai: {
    project: "solofraud-my-2030", // Explicitly required for Vertex AI Express
    location: "us-central1"
  },
  apiKey: GEN_AI_KEY 
});

export async function runRescueAI(prompt: string, modelName: string = "gemini-3.1-flash-lite-preview") {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 2000,
      }
    });
    return response.text;
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

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
}
