import { ai } from "../../lib/genkit";
import { querySemakmuleDB, draftPoliceReport } from "./tools";
import { vertexAISearchRetriever } from "./retriever";
import { z } from "zod";

/**
 * Standard Scam Analysis Schema
 */
const scamAnalysisSchema = z.object({
  verdict: z.enum(["HIGH_RISK", "MEDIUM_RISK", "LOW_RISK"]),
  confidence: z.number(),
  summary: z.string(),
  scamType: z.string(),
  findings: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    detail: z.string(),
    severity: z.enum(["high", "medium", "low"])
  })),
  advice: z.array(z.string()),
});

/**
 * Main entry point for the SoloFraud AI Advisor Chat.
 * Implements a robust fallback strategy to handle API rate limits.
 */
export async function runAgenticChat(chatHistory: any[]) {
  const models = [
    "googleai/gemini-2.5-flash",
    "googleai/gemini-2.5-flash-lite",
    "googleai/gemini-2.5-pro"
  ];

  for (const model of models) {
    try {
      console.log(`[Chat Agent] Attempting prompt with ${model}...`);
      const response = await ai.generate({
        model: model,
        history: chatHistory.slice(0, -1),
        prompt: chatHistory[chatHistory.length - 1].parts[0].text,
        system: 
          "You are the SoloFraud AI Advisor, an autonomous sovereign assistant protecting Malaysians from digital scams. " +
          "You have access to real-time tools to cross-reference databases and draft legal documents. " +
          "When a user provides a phone number or bank account, ALWAYS check it using 'querySemakmuleDB'. " +
          "When a user needs to report a scam, use 'draftPoliceReport'. " +
          "Always ground your advice in the grounded context provided by your retrieval tool. " +
          "Communicate in a professional, protective, and Malaysian-context-aware manner.",
        tools: [querySemakmuleDB, draftPoliceReport],
        retriever: vertexAISearchRetriever,
        config: { temperature: 0.1 },
      });

      return response.text;
    } catch (error: any) {
      console.warn(`[Chat Agent] Model ${model} failed or rate-limited:`, error.message);
      continue; // Try next model in the tier
    }
  }
  
  return "I'm currently experiencing high demand. Please try again in a moment or contact the NSRC at 997 for immediate assistance.";
}


/**
 * Specialized Flow: analyzeMessageFlow
 * This flow is used by the Scam Analyzer dashboard to provide structured risk metrics.
 * Now equipped with 2026-standard Triple-Layer Resilience to solve API limit issues.
 */
export const analyzeMessageFlow = ai.defineFlow(
  {
    name: "analyzeMessageFlow",
    inputSchema: z.object({ message: z.string() }),
    outputSchema: scamAnalysisSchema,
  },
  async (input) => {
    const analysisModels = [
      "googleai/gemini-2.5-flash",
      "googleai/gemini-2.5-flash-lite",
      "googleai/gemini-2.5-pro"
    ];

    for (const model of analysisModels) {
      try {
        console.log(`[Flow] Attempting analysis with ${model}...`);
        const response = await ai.generate({
          model: model,
          prompt: `Analyze this message for scam risks: ${input.message}`,
          output: { schema: scamAnalysisSchema },
          tools: [querySemakmuleDB],
          retriever: vertexAISearchRetriever,
        });
        
        if (response.output) return response.output;
      } catch (error: any) {
        console.warn(`[Flow] ${model} hit a limit or error:`, error.message);
        continue; // Fallback to next model
      }
    }

    throw new Error("Our analysis models are currently undergoing routine 2026 maintenance. Please try again in 30 seconds.");
  }
);
