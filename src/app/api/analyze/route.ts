import { NextResponse } from "next/server";
import { analyzeMessageFlow } from "@/server/ai/agent";
import {
  db,
  isFirestoreClientConfigured,
  isFirestoreReportWriteSuppressed,
  suppressFirestoreReportWrites,
} from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * ScamShield Analyze API
 * 
 * DESIGN PHILOSOPHY: Reliability over everything.
 * Uses a multi-layered fallback system (Vertex -> Rescue -> Heuristic).
 * AI: Vertex (Genkit + express API key) before AI Studio when configured. Set SKIP_GEMINI_STUDIO=true if Studio quota is exhausted.
 * Firestore: same Firebase project; enable Firestore (default database) in console or disable logging.
 */
export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || message.trim().length < 3) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    // LAYER 1: Core AI Analysis (Guaranteed result via fallbacks)
    const analysisResults = await analyzeMessageFlow({ message });
    
    /**
     * LAYER 2: Dashboard Logging (vcutmhack)
     * CRITICAL: This is now wrapped in a non-blocking background task.
     * If Firestore returns NOT_FOUND, it will NOT hang the AI result.
     */
    const saveToDashboard = async () => {
      try {
        await addDoc(collection(db, "reports"), {
          text: message,
          scamType: analysisResults.scamType || "General",
          verdict: analysisResults.verdict,
          confidence: analysisResults.confidence,
          timestamp: serverTimestamp(),
          location: "Malaysia (Live)",
          status: analysisResults.verdict === "HIGH_RISK" ? "confirmed" : "investigating"
        });
      } catch (err: unknown) {
        const code =
          typeof err === "object" && err !== null && "code" in err
            ? String((err as { code: unknown }).code)
            : "";
        if (code === "5" || code === "not-found") {
          suppressFirestoreReportWrites();
          console.warn(
            "[Firestore] NOT_FOUND: Create the default Firestore database in Firebase Console (Build → Firestore). Further report writes are skipped until server restart."
          );
        } else {
          console.warn("[Firestore] Save skipped:", err);
        }
      }
    };

    if (isFirestoreClientConfigured() && !isFirestoreReportWriteSuppressed()) {
      saveToDashboard();
    } else {
      console.warn(
        "[Firestore] Logging disabled: set NEXT_PUBLIC_FIREBASE_* (including APP_ID) in .env.local to persist reports."
      );
    }

    // Immediately return results to the UI
    return NextResponse.json(analysisResults);

  } catch (error: any) {
    console.error("[Analyzer API Critical Error]:", error);
    
    return NextResponse.json({ 
      error: "Analysis failed", 
      detail: error.message,
      verdict: "MEDIUM_RISK", // Ultimate fallback to ensure UI doesn't crash
      summary: "System is experiencing high load. Please try again in a few seconds."
    }, { status: 500 });
  }
}
