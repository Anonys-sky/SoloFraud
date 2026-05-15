import { isScamRelatedAdvisorQuery } from "./advisor-scope";

/** Analyzer only accepts suspicious message text, not general chat. */
export function isAnalyzerMessageInScope(text: string): boolean {
  return isScamRelatedAdvisorQuery(text);
}

export function buildOutOfScopeAnalyzerResult() {
  return {
    verdict: "LOW_RISK" as const,
    confidence: 92,
    summary:
      "This doesn't look like a suspicious message to scan. Paste the actual SMS, WhatsApp, or email you received (e.g. fake bank alert, parcel fee, prize scam, TAC request).",
    findings: [
      {
        icon: "shield",
        label: "Out of scope",
        detail: "General questions and casual chat belong in AI Advisor — not the message analyzer.",
        severity: "low" as const,
      },
    ],
    advice: [
      "Paste the full suspicious message text here for a proper scam scan.",
      "Use AI Advisor for general safety questions or how to report scams.",
    ],
    scamType: "Not a message to analyze",
  };
}
