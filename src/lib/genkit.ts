import { genkit } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";

/**
 * Genkit Instance Initialization
 * This is the central orchestrator for our Agentic AI workflows.
 * Migrated to Vertex AI for enterprise reliability and hackathon credit utilization.
 */
export const ai = genkit({
  plugins: [
    vertexAI({ 
      location: "asia-southeast1", // Match Cloud Run region
      projectId: "solofraud-my-2030", // Explicit Project ID
    }),
  ],
  model: "vertexai/gemini-1.5-flash",
});

