import { NextRequest, NextResponse } from "next/server";

/**
 * ScamShield MY — AI Chat Advisor API
 * 
 * Uses Gemini 2.0 Flash for conversational scam advisory.
 * Fallback to curated responses for demo mode.
 */

async function chatWithGemini(message: string, history: { role: string; content: string }[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are ScamShield MY AI Advisor — a friendly, knowledgeable anti-scam consultant for Malaysians.

Your role:
- Help users identify if messages, calls, or situations are scams
- Provide actionable advice specific to Malaysia (PDRM, BNM, MCMC contacts)
- Explain scam tactics in simple Malay and English
- Guide users on how to report scams
- Share latest scam trends in Malaysia

Key contacts to reference:
- NSRC (National Scam Response Centre): 997
- PDRM CCID: 03-2610 1559
- PDRM WhatsApp: +6013-211 1222
- Bank Negara: 1-300-88-5465
- MCMC: 1-800-188-030
- SemakMule: https://semakmule.rmp.gov.my

Be empathetic, clear, and use emojis for readability. Format with markdown bold for key points.
If someone has already been scammed, prioritize emotional support and immediate action steps.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System: " + systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ScamShield MY AI Advisor, ready to help Malaysians stay safe from scams." }] },
        ...history.map(h => ({
          role: h.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: h.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Gemini chat error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await chatWithGemini(message, history);

    if (response) {
      return NextResponse.json({ response, engine: "gemini-2.0-flash" });
    }

    // Fallback demo response
    return NextResponse.json({
      response: "I'm currently running in demo mode. In production, I use Google Gemini 2.0 Flash for intelligent responses. Please set the GEMINI_API_KEY environment variable to enable AI-powered advisory.",
      engine: "demo-fallback",
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
