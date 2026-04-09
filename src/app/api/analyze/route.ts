import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * SoloFraud — Agentic Message Analysis API
 * 
 * Hackathon Implementation: 
 * Upgraded from a simple LLM call to a Multi-Step Reasoning Flow (Agentic AI)
 * Step 1: Entity Extraction & Threat Lookups via Tool simulation
 * Step 2: Final Verdict Synthesis
 */

const apiKey = process.env.GEMINI_API_KEY;

// Mock Threat Database lookup (Simulating RAG or External API connection)
async function fetchThreatIntelligence(message: string) {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
  
  const lower = message.toLowerCase();
  const intelligence = [];
  
  if (lower.includes("maybank") || lower.includes("cimb")) {
    intelligence.push("THREAT_INTEL: High frequency of banking impersonation SMS reported in the last 48 hours. Valid banks do not send links in SMS.");
  }
  if (lower.includes("rm") || lower.includes("menang")) {
    intelligence.push("THREAT_INTEL: Prize scams and Macau scam lures are active. 99% of unsolicited prize claims require upfront payment and are fraudulent.");
  }
  if (lower.includes(".cc") || lower.includes(".xyz") || lower.includes("bit.ly")) {
    intelligence.push("THREAT_INTEL: URL shorteners and cheap domains (.cc, .xyz) in SMS are universally flagged as malicious credential harvesting vectors by MCMC.");
  }
  
  return intelligence.length > 0 ? intelligence.join("\n") : "THREAT_INTEL: No trending threat campaigns detected matching this exact text footprint.";
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    /* ──── Step 1: Gather Intelligence (Action) ──── */
    const threatIntel = await fetchThreatIntelligence(message);

    /* ──── Step 2: LLM Synthesis ──── */
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
    const prompt = `
Analyze the following message for potential scam indicators. Use the provided Threat Intelligence context to ground your assessment.

[THREAT INTELLIGENCE RAG CONTEXT]
${threatIntel}

[USER MESSAGE TO ANALYZE]
"""
${message}
"""

[REQUIRED JSON RESPONSE FORMAT]
{
  "verdict": "HIGH_RISK" or "MEDIUM_RISK" or "LOW_RISK",
  "confidence": number 0-100,
  "summary": "clinical concise summary",
  "scamType": "e.g. Macau Scam, Parcel Scam, Investment Scam, Love Scam, TAC Phishing, Job Scam, or Unknown",
  "findings": [
    {
      "icon": "single emoji",
      "label": "short label",
      "detail": "explanation",
      "severity": "high" or "medium" or "low"
    }
  ],
  "advice": ["actionable step 1", "actionable step 2"]
}
Respond with ONLY the JSON object, no markdown.
`;

    let parsed: any = null;
    let usedModel = "";
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: "You are the primary engine for SoloFraud. You perform precise diagnostic analysis of messages based on the provided Threat Intelligence. Reply strictly in JSON format as specified.",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
        usedModel = modelName;
        break;
      } catch (modelErr: any) {
        console.warn(`[Analyze] ${modelName} failed:`, modelErr.message?.substring(0, 100));
        if (modelName === modelNames[modelNames.length - 1]) throw modelErr;
      }
    }
    
    // Append the agentic metadata
    return NextResponse.json({ 
      ...parsed, 
      analyzedBy: `${usedModel} (Agentic Workflow)` 
    });

  } catch (error: any) {
    console.error("Agentic Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed", detail: error.message }, { status: 500 });
  }
}
