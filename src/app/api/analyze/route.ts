import { NextRequest, NextResponse } from "next/server";

/**
 * ScamShield MY — Scam Message Analysis API
 * 
 * In production, this calls Gemini 2.0 Flash via @google/generative-ai.
 * For the hackathon demo, it uses intelligent pattern matching as fallback.
 */

interface Finding {
  icon: string;
  label: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

interface AnalysisResult {
  verdict: "HIGH_RISK" | "MEDIUM_RISK" | "LOW_RISK";
  confidence: number;
  summary: string;
  findings: Finding[];
  advice: string[];
  scamType: string;
  analyzedBy: string;
}

// Try to use Gemini, fallback to rule-based
async function analyzeWithGemini(message: string): Promise<AnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are ScamShield MY, an AI scam detection system for Malaysia. Analyze the following message for potential scam indicators.

Message to analyze:
"""
${message}
"""

Respond in this exact JSON format:
{
  "verdict": "HIGH_RISK" | "MEDIUM_RISK" | "LOW_RISK",
  "confidence": <number 0-100>,
  "summary": "<brief summary of analysis>",
  "scamType": "<e.g., Macau Scam, Parcel Scam, Investment Scam, Love Scam, TAC Phishing, or Unknown>",
  "findings": [
    {
      "icon": "<emoji>",
      "label": "<short label>",
      "detail": "<explanation>",
      "severity": "high" | "medium" | "low"
    }
  ],
  "advice": ["<action item 1>", "<action item 2>"]
}

Consider Malaysian context: BNM, PDRM, Maybank, CIMB, Shopee, Lazada, PosLaju, LHDN scam patterns. Respond ONLY with valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return { ...parsed, analyzedBy: "gemini-2.0-flash" };
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

function analyzeWithRules(message: string): AnalysisResult {
  const lower = message.toLowerCase();
  const findings: Finding[] = [];
  let riskScore = 0;

  if (/24 jam|hours?|immediately|segera|tamat|urgent/i.test(message)) {
    findings.push({ icon: "⏰", label: "Urgency Pressure", detail: "Creates artificial time pressure to prevent rational thinking", severity: "high" });
    riskScore += 25;
  }

  const banks = ["maybank", "cimb", "rhb", "public bank", "bank negara", "bsn", "ambank", "hong leong", "lhdn"];
  const impersonated = banks.find(b => lower.includes(b));
  if (impersonated) {
    findings.push({ icon: "🏦", label: "Brand Impersonation", detail: `References "${impersonated.toUpperCase()}" — verify through official channels`, severity: "high" });
    riskScore += 30;
  }

  if (/bit\.ly|tinyurl|\.cc\/|\.tk\/|\.ml\/|goo\.gl/i.test(message)) {
    findings.push({ icon: "🔗", label: "Suspicious URL", detail: "Uses URL shortener or non-official domain", severity: "high" });
    riskScore += 25;
  }

  if (/rm\s?\d|memenangi|winner|hadiah|roi|guarantee|jaminan/i.test(message)) {
    findings.push({ icon: "💰", label: "Financial Lure", detail: "Promises unrealistic monetary reward", severity: "high" });
    riskScore += 20;
  }

  if (/tac|otp|pin|password|kata laluan|6.digit|reply with/i.test(message)) {
    findings.push({ icon: "🔐", label: "Credential Theft", detail: "Requests sensitive authentication codes", severity: "high" });
    riskScore += 35;
  }

  if (/whatsapp|wa\.me|\+60\s?1[0-9]/i.test(message)) {
    findings.push({ icon: "📱", label: "Suspicious Contact", detail: "Directs to personal messaging channel", severity: "medium" });
    riskScore += 15;
  }

  if (/trading|bot|invest|300%|roi|monthly return/i.test(message)) {
    findings.push({ icon: "📈", label: "Investment Scam Pattern", detail: "Promises guaranteed high returns", severity: "high" });
    riskScore += 25;
  }

  if (findings.length === 0) {
    findings.push({ icon: "🔍", label: "No Obvious Red Flags", detail: "Message appears relatively normal", severity: "low" });
  }

  riskScore = Math.min(riskScore, 99);
  const confidence = Math.min(50 + riskScore * 0.5, 99.2);

  let verdict: AnalysisResult["verdict"] = "LOW_RISK";
  let scamType = "Unknown";
  const advice: string[] = [];

  if (riskScore >= 60) {
    verdict = "HIGH_RISK";
    advice.push("Do NOT click any links or share personal information",
      "Report to CCID: 03-2610 1559", "Report to NSRC: 997", "Block and delete the message");
  } else if (riskScore >= 30) {
    verdict = "MEDIUM_RISK";
    advice.push("Verify independently via official channels", "Do not click links");
  } else {
    advice.push("Message appears normal, stay vigilant", "Never share OTP/TAC codes");
  }

  if (/memenangi|winner|hadiah/i.test(message)) scamType = "Lucky Draw / Macau Scam";
  else if (/parcel|customs|delivery|pos/i.test(message)) scamType = "Parcel Delivery Scam";
  else if (/tac|otp|pin/i.test(message)) scamType = "TAC/OTP Phishing";
  else if (/invest|trading|roi/i.test(message)) scamType = "Investment / Ponzi Scam";

  return {
    verdict, confidence, findings, advice, scamType, analyzedBy: "rule-engine-v1",
    summary: riskScore >= 60
      ? "This message exhibits multiple characteristics of a known scam pattern."
      : riskScore >= 30
      ? "This message contains suspicious elements that warrant caution."
      : "This message appears to be relatively safe.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Try Gemini first, fallback to rules
    let result = await analyzeWithGemini(message);
    if (!result) {
      result = analyzeWithRules(message);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
