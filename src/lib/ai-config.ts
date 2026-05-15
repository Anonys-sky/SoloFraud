/**
 * Firebase vs GCP: Firebase project id can differ from the GCP project
 * where Vertex / Agent Platform is enabled.
 */

/** GCP project for Vertex AI (e.g. utm-hack). */
export const VERTEX_GCP_PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
  process.env.VERTEX_GCP_PROJECT?.trim() ||
  process.env.GCLOUD_PROJECT?.trim() ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
  process.env.FIREBASE_PROJECT_ID?.trim() ||
  "utm-hack";

export const VERTEX_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
  process.env.VERTEX_LOCATION?.trim() ||
  "asia-southeast1";

/**
 * Google AI Studio key (AIza…). Omit from Vertex express flows.
 */
export function getGeminiStudioKey(): string {
  const k = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ""
  ).trim();
  if (k.startsWith("AQ.")) return "";
  return k;
}

export function hasGoogleAIStudio(): boolean {
  return getGeminiStudioKey().length > 0;
}

/**
 * Agent Platform / Vertex express API key (often AQ.…).
 */
export function getVertexAgentApiKey(): string {
  const dedicated = (
    process.env.GOOGLE_GENAI_VERTEX_API_KEY ||
    process.env.VERTEX_AGENT_API_KEY ||
    ""
  ).trim();
  if (dedicated) return dedicated;
  const k = (process.env.GEMINI_API_KEY || "").trim();
  if (k.startsWith("AQ.")) return k;
  return "";
}

export function hasVertexAgentApiKey(): boolean {
  return getVertexAgentApiKey().length > 0;
}

/**
 * Vertex / Genkit: use stable refs where Google maps an alias (2.0 flash* → *-001).
 * 2.5 * / 2.5-pro: alias equals stable per Vertex model table.
 */
export function modelPriorityForAnalysis(): string[] {
  const vertex = [
    "vertexai/gemini-2.5-flash-lite",
    "vertexai/gemini-2.0-flash-lite",
    "vertexai/gemini-2.5-flash",
    "vertexai/gemini-2.0-flash-001",
    "vertexai/gemini-2.5-pro",
    "vertexai/gemini-1.5-flash",
  ];
  const skipStudio = process.env.SKIP_GEMINI_STUDIO === "true";
  if (hasGoogleAIStudio() && !skipStudio) {
    return [
      ...vertex,
      "googleai/gemini-2.5-flash",
      "googleai/gemini-2.5-flash-lite",
      "googleai/gemini-2.0-flash-001",
      "googleai/gemini-2.0-flash-lite-001",
    ];
  }
  return vertex;
}

export function modelPriorityForChat(): string[] {
  return modelPriorityForAnalysis();
}
