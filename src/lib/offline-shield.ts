/**
 * SoloFraud Local Heuristic Shield
 * Portable logic that runs directly in the browser for offline protection.
 */

export interface AnalysisResult {
  verdict: "HIGH_RISK" | "MEDIUM_RISK" | "LOW_RISK";
  confidence: number;
  summary: string;
  findings: any[];
  advice: string[];
  scamType: string;
}

export function runOfflineAnalysis(message: string): AnalysisResult {
  const msg = message.toLowerCase();
  
  // High-Risk Patterns (MALAYSIAN CONTEXT)
  const isHighRisk = 
    (msg.includes("tac") && (msg.includes("nombor") || msg.includes("code"))) ||
    (msg.includes("bank") && (msg.includes("alert") || msg.includes("security") || msg.includes("blocked"))) ||
    (msg.includes("police") && msg.includes("report")) ||
    (msg.includes("roi") && (msg.includes("%") || msg.includes("return"))) ||
    (msg.includes("profit") && msg.includes("guarantee")) ||
    (msg.includes("investment") || msg.includes("pelaburan")) ||
    (msg.includes("trading") && msg.includes("bot")) ||
    (msg.includes("parcel") && (msg.includes("held") || msg.includes("customs") || msg.includes("pay"))) ||
    msg.includes("maybank") ||
    msg.includes("cimb") ||
    msg.includes("shopee") ||
    msg.includes("poslaju") ||
    msg.includes("tahniah") ||
    msg.includes("menang") ||
    msg.includes("hadiah") ||
    msg.includes("pemenang") ||
    msg.includes("kastam") ||
    msg.includes("lhdn") ||
    msg.includes("kwsp") ||
    msg.includes("jais");

  if (isHighRisk) {
    return {
      verdict: "HIGH_RISK",
      confidence: 85,
      summary: "OFFLINE PROTECTION: Our local shield identified clear phishing patterns (TAC/Bank impersonation) commonly used in Malaysia.",
      findings: [
        { icon: "pattern", label: "Known Pattern", detail: "Traditional Malaysian scam signature detected locally.", severity: "high" },
        { icon: "network", label: "Offline Mode", detail: "Analysis performed locally without internet connection.", severity: "low" }
      ],
      advice: [
        "Do NOT click any links.",
        "Do NOT share any TAC or OTP codes.",
        "Report to NSRC 997 immediately.",
        "Block this sender."
      ],
      scamType: "Verified Scam Signature (Offline)"
    };
  }

  // Medium-Risk Patterns
  const isMediumRisk = 
    msg.includes("urgent") || 
    msg.includes("immediate") || 
    msg.includes("suspicious") || 
    msg.includes("account held") ||
    msg.includes("win");

  if (isMediumRisk) {
    return {
      verdict: "MEDIUM_RISK",
      confidence: 60,
      summary: "OFFLINE PROTECTION: Suspicious language detected. Full AI analysis is unavailable without internet.",
      findings: [
        { icon: "⚠️", label: "Urgency Detected", detail: "Message uses high-pressure language typical of scams.", severity: "medium" }
      ],
      advice: [
        "Treat with high caution.",
        "Re-scan once you have internet connection for full AI deep-dive.",
        "Verify directly with the official institution."
      ],
      scamType: "Suspicious Language (Offline)"
    };
  }

  return {
    verdict: "LOW_RISK",
    confidence: 30,
    summary: "OFFLINE PROTECTION: No obvious scam signatures found locally. Connect to internet for full AI analysis.",
    findings: [
      { icon: "🛡️", label: "Local Scan", detail: "No known signatures found in our offline database.", severity: "low" }
    ],
    advice: [
      "Still maintain caution with unknown senders.",
      "Connect to internet for a comprehensive Gemini AI scan."
    ],
    scamType: "No Signatures Detected (Offline)"
  };
}
