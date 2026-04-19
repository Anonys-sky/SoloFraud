import { NextResponse } from "next/server";
// We moved our AI agent logic to the server folder to keep front and back ends clearly separated!
import { runAgenticChat } from "@/server/ai/agent";
import { checkRateLimit } from "@/lib/security";

export async function POST(req: Request) {
  try {
    // LAYER 3: Gatekeeper Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.success) {
      console.warn(`[Security Alert] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ 
        error: "Too many requests", 
        detail: "Security Gatekeeper: Limit exceeded." 
      }, { status: 429 });
    }

    // This is where we grab the chat history sent from the frontend user interface
    const { messages } = await req.json();

    // Basic safety check: make sure we actually received a valid array of messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Gemini gets confused if the conversation starts with an AI response instead of a User prompt.
    // So here, we chop off any welcome messages at the top of the chat history.
    let trimmedMessages = [...messages];
    while (trimmedMessages.length > 0 && trimmedMessages[0].role !== "user") {
      trimmedMessages.shift();
    }

    // Now we reformat our app's message array into the exact object shape Gemini expects.
    // "assistant" becomes "model" in Google's terminology.
    const formattedHistory = trimmedMessages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Here's the magic! We pass the sanitized history into our autonomous Agent.
    const agentResponseText = await runAgenticChat(formattedHistory);

    // Send the AI's final answer back to the frontend to be displayed.
    return NextResponse.json({ text: agentResponseText });
    
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    // If the server crashes, we gracefully inform the user something broke,
    // and send back a 500 status (Internal Server Error).
    return NextResponse.json({ 
      error: "Failed to process chat request",
      details: error.stack || error.message 
    }, { status: 500 });
  }
}
