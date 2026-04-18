import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { vertexAI } from "@genkit-ai/vertexai";

/**
 * Genkit Instance Initialization: HYBRID MODE
 * Combining AI Studio (Compliance) with Vertex AI (Resilience).
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
    vertexAI({ 
      location: "asia-southeast1", 
      projectId: "solofraud-my-2030" 
    }),
  ],
  model: "googleai/gemini-1.5-flash-latest",
});

