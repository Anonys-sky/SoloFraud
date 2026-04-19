import { GoogleGenAI } from "@google/genai";

/**
 * SoloFraud Rescue AI SDK - Vertex API Key Edition
 * Ported directly from the Hackathon Python configuration.
 */

let aiInstance: any = null;

function getAI() {
  if (aiInstance) return aiInstance;
  
  const GEN_AI_KEY = process.env.GEMINI_API_KEY as string;
  if (!GEN_AI_KEY) {
    console.warn("[Rescue AI] Missing GEMINI_API_KEY. AI features will be disabled until configured.");
  }

  aiInstance = new GoogleGenAI({
    vertexai: {
      project: "solofraud-my-2030", 
      location: "us-central1"
    },
    apiKey: GEN_AI_KEY 
  });
  return aiInstance;
}

export async function runRescueAI(prompt: string, modelName: string = "gemini-3.1-flash-lite-preview") {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: 
          "You are the SoloFraud AI Advisor, an autonomous sovereign guardian protecting Malaysians. " +
          "Your mission is the 'Speed Revolution': reducing victim response time from hours to 3 seconds. " +
          "ACTION POLICY: If investigating a number or bank, you MUST autonomously use the Google Search tool to verify latest community scam reports. " +
          "CRITICAL RULE: Every single time you invoke the tool, you MUST explicitly announce your autonomous action at the very beginning of your response using this exact format on its own line: `[AGENT ACTION: Explaining what tool you used and the parameters]`. This is required to visually prove your agentic capabilities.",
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
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
      "verdict": "SAFE" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK",
      "confidence": number between 0 and 100,
      "summary": "one sentence high level risk summary",
      "findings": [
        { "icon": "emoji", "label": "finding name", "detail": "finding detail", "severity": "low|medium|high" }
      ],
      "advice": ["array of advice strings"],
      "scamType": "the identified scam type"
    }
  `;

  const ai = getAI();
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
