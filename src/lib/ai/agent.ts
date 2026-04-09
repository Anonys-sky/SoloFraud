import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";

// Instantiation deferred to runtime to ensure env vars are loaded

// Define the tools (Functions) our Agent can execute
const querySemakmuleDeclaration: FunctionDeclaration = {
  name: "querySemakmuleDB",
  description: "Queries the Malaysian national database (SemakMule) to check if a phone number or bank account has been reported for scams or fraudulent activities.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      phoneNumber: {
        type: SchemaType.STRING,
        description: "The phone number to check, usually starting with +60 or 01",
      },
      bankAccount: {
        type: SchemaType.STRING,
        description: "The bank account number to check (optional)",
      },
    },
    required: ["phoneNumber"],
  },
};

const draftReportDeclaration: FunctionDeclaration = {
  name: "draftPoliceReport",
  description: "Drafts a formal, structured police report based on the details of the scam incident provided by the user. Used when a user wants to report a scam.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      incidentDetails: {
        type: SchemaType.STRING,
        description: "Full summary of how the scam occurred, including what the scammer claimed.",
      },
      scammerContact: {
        type: SchemaType.STRING,
        description: "The phone number or username of the scammer.",
      },
      financialLoss: {
        type: SchemaType.STRING,
        description: "The estimated amount lost (RM) if applicable.",
      },
    },
    required: ["incidentDetails", "scammerContact"],
  },
};

// Implement the actual tool mock functions
const toolsFunctions = {
  querySemakmuleDB: async ({ phoneNumber, bankAccount }: { phoneNumber: string; bankAccount?: string }) => {
    console.log(`[Agent Tool] Executing querySemakmuleDB for ${phoneNumber}`);
    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock Agentic logic: pretend certain numbers are highly flagged
    if (phoneNumber.includes("11") || phoneNumber.includes("123")) {
      return {
        status: "FLAGGED",
        reportCount: 14,
        lastReported: "2 days ago",
        associatedScams: ["Macau Scam", "Impersonation of Authority"],
        recommendation: "DO NOT ENGAGE. HIGH RISK.",
      };
    }
    return {
      status: "CLEAN",
      reportCount: 0,
      notes: "No reports found in SemakMule. However, exercise caution as numbers can be spoofed.",
    };
  },
  
  draftPoliceReport: async ({ incidentDetails, scammerContact, financialLoss }: any) => {
    console.log(`[Agent Tool] Executing draftPoliceReport for ${scammerContact}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const timestamp = new Date().toISOString().split('T')[0];
    const reportRef = `NSRC-${Math.floor(Math.random() * 90000) + 10000}`;
    
    const draft = `
**[OFFICIAL INITIAL REPORT DRAFT - NSRC]**
Reference No: ${reportRef}
Date: ${timestamp}

**1. Incident Summary:**
${incidentDetails}

**2. Scammer Information:**
Contact/Handle: ${scammerContact}

**3. Financial Impact:**
Reported Loss: ${financialLoss ? `RM ${financialLoss}` : "None / Unspecified"}

**Action Required:**
Please bring this draft to the nearest police station or submit via the NSRC portal (997) for immediate execution.
`.trim();

    return { draftTemplate: draft, referenceId: reportRef };
  }
};

/**
 * Main entry point for the Chat Agent.
 * It takes a conversation history, sends it to Gemini configured with tools,
 * and handles autonomous tool execution if Gemini requests it.
 */
export async function runAgenticChat(chatHistory: { role: string; parts: { text: string }[] }[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const systemPrompt = 
    "You are the SoloFraud AI Advisor, a helpful autonomous assistant protecting Malaysians from scams. " +
    "If the user provides a suspicious phone number, ALWAYS use the 'querySemakmuleDB' tool to check it. " +
    "If the user wants to report a scam, ALWAYS use the 'draftPoliceReport' tool to help them format it correctly. " +
    "Use Markdown formatting. Be polite and professional.";

  const latestMessage = chatHistory[chatHistory.length - 1].parts[0].text;

  // Try gemini-2.0-flash with tools first, fallback to 1.5-flash without tools
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
      tools: [
        { functionDeclarations: [querySemakmuleDeclaration, draftReportDeclaration] },
      ],
    });

    const chat = model.startChat({
      history: chatHistory.slice(0, -1),
    });

    let result = await chat.sendMessage(latestMessage);
    
    const functionCalls = result.response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const functionName = call.name;
      const functionArgs = call.args;
      
      console.log(`[Agentic Orchestration] Model requested to call tool: ${functionName}`);
      
      let apiResponse;
      if (functionName === "querySemakmuleDB") {
        apiResponse = await toolsFunctions.querySemakmuleDB(functionArgs as any);
      } else if (functionName === "draftPoliceReport") {
        apiResponse = await toolsFunctions.draftPoliceReport(functionArgs as any);
      } else {
        apiResponse = { error: "Function not found" };
      }
      
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: functionName,
            response: apiResponse as any,
          }
        }
      ]);
    }

    return result.response.text();
  } catch (err: any) {
    console.warn("[Agent] gemini-2.0-flash failed, falling back to 1.5-flash:", err.message?.substring(0, 100));
    
    // Fallback: use gemini-1.5-flash without tools (simpler but still works)
    const fallbackModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt + " Note: Tools are unavailable in this session, provide your best advice based on your knowledge.",
    });

    const chat = fallbackModel.startChat({
      history: chatHistory.slice(0, -1),
    });

    const result = await chat.sendMessage(latestMessage);
    return result.response.text();
  }
}
