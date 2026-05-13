import { genkit } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import { googleAI } from "@genkit-ai/googleai";
import {
  VERTEX_GCP_PROJECT_ID,
  VERTEX_LOCATION,
  getGeminiStudioKey,
  hasGoogleAIStudio,
  modelPriorityForAnalysis,
} from "./ai-config";

const plugins = [];

if (hasGoogleAIStudio()) {
  plugins.push(googleAI({ apiKey: getGeminiStudioKey() }));
}

if (process.env.DISABLE_VERTEX_AI !== "true") {
  plugins.push(
    vertexAI({
      projectId: VERTEX_GCP_PROJECT_ID,
      location: VERTEX_LOCATION,
    })
  );
}

if (plugins.length === 0) {
  throw new Error(
    "[Genkit] No AI backend configured. Set GEMINI_API_KEY (recommended) or set DISABLE_VERTEX_AI=false with Vertex enabled on GCP_PROJECT_ID."
  );
}

const defaultModel = modelPriorityForAnalysis()[0];

export const ai = genkit({
  plugins,
  model: defaultModel,
});
