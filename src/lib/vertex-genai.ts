import { GoogleGenAI } from "@google/genai";
import { getVertexAgentApiKey } from "./ai-config";

/**
 * Vertex AI in "API key express" mode.
 * Do NOT pass project/location in the constructor together with apiKey — the SDK throws.
 * With explicit `apiKey`, it clears env-derived project/location internally (see @google/genai NodeAuth).
 * Keep GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION in .env for routing if the SDK needs them elsewhere.
 *
 * Model IDs: use Vertex stable refs (e.g. gemini-2.0-flash → gemini-2.0-flash-001).
 */
const VERTEX_GENAI_MODEL_CANDIDATES = [
  process.env.VERTEX_GEMINI_MODEL?.trim(),
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash",
].filter((m): m is string => !!m && m.length > 0);

export async function generateTextVertexWithApiKey(
  prompt: string
): Promise<string> {
  const apiKey = getVertexAgentApiKey();
  if (!apiKey) {
    throw new Error(
      "[Vertex GenAI] Missing GOOGLE_GENAI_VERTEX_API_KEY or AQ.* GEMINI_API_KEY"
    );
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    apiKey,
  });

  let lastError: unknown;
  for (const model of VERTEX_GENAI_MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0.1 },
      });
      const text = response.text;
      if (text) return text;
    } catch (error) {
      lastError = error;
      console.warn(
        `[Vertex GenAI] model ${model}:`,
        error instanceof Error ? error.message : error
      );
    }
  }
  throw lastError ?? new Error("[Vertex GenAI] All model candidates failed");
}
