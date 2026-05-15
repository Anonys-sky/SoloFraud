import { ai } from "./genkit";
import { hasVertexAgentApiKey, modelPriorityForAnalysis } from "./ai-config";
import { generateTextVertexWithApiKey } from "./vertex-genai";

/**
 * ScamShield Rescue AI — Vertex Agent API key (@google/genai) first, then Genkit fallbacks.
 */

async function tryVertexAgentText(
  prompt: string,
  fast?: boolean
): Promise<string | null> {
  if (!hasVertexAgentApiKey()) return null;
  try {
    return await generateTextVertexWithApiKey(prompt, { fast });
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

function normalizeAnalysisVerdict(raw: Record<string, unknown>) {
  if (raw.verdict === "SAFE") raw.verdict = "LOW_RISK";
  return raw;
}

export async function runRescueAnalysis(message: string) {
  const escaped = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const prompt = `Malaysian scam analyzer. Message to scan:
"${escaped}"

Return ONLY valid JSON (no markdown):
{"verdict":"HIGH_RISK|MEDIUM_RISK|LOW_RISK","confidence":0-100,"summary":"string","findings":[{"icon":"pattern|network|urgency|shield","label":"string","detail":"string","severity":"high|medium|low"}],"advice":["string"],"scamType":"string"}

If the text is general chat or not a message to analyze, use LOW_RISK and say out of scope in summary.`;

  try {
    const fromVertex = await tryVertexAgentText(prompt, true);
    const text =
      fromVertex ??
      (await generateTextWithModelFallback(prompt, modelPriorityForAnalysis()))
        .text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return normalizeAnalysisVerdict(
      JSON.parse(jsonMatch ? jsonMatch[0] : text) as Record<string, unknown>
    );
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
