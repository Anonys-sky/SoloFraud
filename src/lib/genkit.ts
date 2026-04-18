import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

/**
 * Genkit Instance Initialization
 * This is the central orchestrator for our Agentic AI workflows.
 * Reverted to Google AI Studio for strict hackathon compliance.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: "googleai/gemini-1.5-flash",
});

