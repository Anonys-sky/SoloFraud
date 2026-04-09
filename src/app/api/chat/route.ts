import { NextResponse } from "next/server";
import { runAgenticChat } from "@/lib/ai/agent";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Convert frontend messages to the format expected by the Gemini SDK
    // Also skip any leading assistant messages (like the welcome message) to avoid Gemini validation errors
    let trimmedMessages = [...messages];
    while (trimmedMessages.length > 0 && trimmedMessages[0].role !== "user") {
      trimmedMessages.shift();
    }

    const formattedHistory = trimmedMessages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Call the Agentic Workflow Orchestrator
    const agentResponseText = await runAgenticChat(formattedHistory);

    return NextResponse.json({ text: agentResponseText });
    
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    try {
      require('fs').writeFileSync('api_error.log', error.stack || error.message);
    } catch(e) {}
    return NextResponse.json({ 
      error: "Failed to process chat request",
      details: error.stack || error.message 
    }, { status: 500 });
  }
}
