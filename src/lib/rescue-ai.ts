import { ai } from "./genkit";
import { hasVertexAgentApiKey, modelPriorityForAnalysis } from "./ai-config";
import { generateTextVertexWithApiKey } from "./vertex-genai";

/**
 * ScamShield Rescue AI — Vertex Agent API key (@google/genai) first, then Genkit fallbacks.
 */

async function tryVertexAgentText(prompt: string): Promise<string | null> {
  if (!hasVertexAgentApiKey()) return null;
  try {
    return await generateTextVertexWithApiKey(prompt);
  } catch (error) {
    console.warn(
      "[Rescue AI] Vertex Agent (API key) failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function generateTextWithModelFallback(prompt: string, models: string[]) {
  let lastError: unknown;
  for (const model of models) {
    try {
      return await ai.generate({
        model,
        prompt,
        config: { temperature: 0.1 },
      });
    } catch (error) {
      lastError = error;
      console.warn(
        `[Rescue AI] Model ${model} failed:`,
        error instanceof Error ? error.message : error
      );
    }
  }
  throw lastError;
}

export async function runRescueAnalysis(message: string) {
  const prompt = `
    Analyze this message for scam risks: "${message}"
    Return your response EXCLUSIVELY as a JSON object with this exact structure:
    {
      "verdict": "SAFE" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK",
      "confidence": number,
      "summary": "string",
      "findings": [{ "icon": "string", "label": "string", "detail": "string", "severity": "low|medium|high" }],
      "advice": ["string"],
      "scamType": "string"
    }
  `;

  try {
    const fromVertex = await tryVertexAgentText(prompt);
    const text =
      fromVertex ??
      (await generateTextWithModelFallback(prompt, modelPriorityForAnalysis()))
        .text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("[Rescue AI] Analysis failure (all models):", error);
    throw error;
  }
}

export async function runRescueAI(prompt: string, modelName?: string) {
  const models = modelName
    ? [modelName, ...modelPriorityForAnalysis().filter((m) => m !== modelName)]
    : modelPriorityForAnalysis();
  try {
    const fromVertex = await tryVertexAgentText(prompt);
    if (fromVertex) return fromVertex;
    const response = await generateTextWithModelFallback(prompt, models);
    return response.text;
  } catch (error) {
    console.error("[Rescue AI] Chat failure (all models):", error);
    throw error;
  }
}
