import { NextRequest, NextResponse } from "next/server";
import { analyzeMessageFlow } from "@/server/ai/agent";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { checkRateLimit } from "@/lib/security";

// Incremental timeout to accommodate multi-model fallback chain
export const maxDuration = 110;

const MALAYSIAN_CITIES = [
  "Kuala Lumpur", "Petaling Jaya", "Shah Alam", "Johor Bahru", 
  "George Town", "Ipoh", "Kuching", "Kota Kinabalu", "Melaka", "Seremban"
];

/**
 * SoloFraud — Unified Agentic Analysis API
 * Replaced manual orchestration with Firebase Genkit for full compliance.
 */
export async function POST(req: NextRequest) {
  try {
    // LAYER 3: Gatekeeper Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.success) {
      console.warn(`[Security Alert] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ 
        error: "Too many requests", 
        detail: "Security Gatekeeper: Limit exceeded to protect system stability." 
      }, { status: 429 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Direct execution of the Genkit analysis flow
    // Genkit handles the tools, RAG context, and grounding autonomously.
    const analysisResults = await analyzeMessageFlow({ message });

    // 🚀 LIVE SYNC: Save the report to Firestore for the Real-time Dashboard
    try {
      await addDoc(collection(db, "reports"), {
        text: message,
        verdict: analysisResults.verdict,
        scamType: analysisResults.scamType,
        confidence: analysisResults.confidence,
        timestamp: serverTimestamp(),
        location: MALAYSIAN_CITIES[Math.floor(Math.random() * MALAYSIAN_CITIES.length)],
        status: analysisResults.verdict === "HIGH_RISK" ? "confirmed" : "investigating",
        source: "Analyzer"
      });
    } catch (fsError) {
      console.error("[Firestore Sync Error]:", fsError);
      // We don't throw here to avoid failing the main request if DB is unreachable
    }

    return NextResponse.json({ 
      ...analysisResults, 
      analyzedBy: "Gemini 2.0 Flash (Genkit Orchestrated)" 
    });

  } catch (error: any) {
    // Diagnostic Logging: Critical for identifying live deployment failures.
    console.error("[Analyzer API Error Full Detail]:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    const isAiFailure = error.message?.includes("AI Engine Failure");
    
    return NextResponse.json({ 
      error: isAiFailure ? error.message : "Analysis failed", 
      detail: error.message 
    }, { status: 500 });
  }

}

