import { ai } from "../../lib/genkit";
import { z } from "zod";
import { generatePoliceReportDraft } from "./police-draft";

/**
 * Tool: querySemakmuleDB
 * Queries the Malaysian national database (SemakMule) to check if a phone number or bank account is fraudulent.
 */
export const querySemakmuleDB = ai.defineTool(
  {
    name: "querySemakmuleDB",
    description: "Queries the Malaysian national database (SemakMule) to check if a phone number or bank account has been reported for scams or fraudulent activities.",
    inputSchema: z.object({
      phoneNumber: z.string().describe("The phone number to check, usually starting with +60 or 01"),
      bankAccount: z.string().optional().describe("The bank account number to check (optional)"),
    }),
    outputSchema: z.object({
      status: z.string(),
      reportCount: z.number(),
      lastReported: z.string().optional(),
      associatedScams: z.array(z.string()).optional(),
      recommendation: z.string(),
      notes: z.string().optional(),
    }),
  },
  async ({ phoneNumber, bankAccount }) => {
    console.log(`[Genkit Tool] Executing querySemakmuleDB for ${phoneNumber}`);
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
      recommendation: "Stay vigilant but no active reports found.",
    };
  }
);

/**
 * Tool: draftPoliceReport
 * Drafts a formal, structured police report based on the details of the scam incident.
 */
export const draftPoliceReport = ai.defineTool(
  {
    name: "draftPoliceReport",
    description: "Drafts a formal, structured police report based on the details of the scam incident provided by the user. Used when a user wants to report a scam.",
    inputSchema: z.object({
      incidentDetails: z.string().describe("Full summary of how the scam occurred, including what the scammer claimed."),
      scammerContact: z.string().optional().describe("The phone number or username of the scammer if known, otherwise leave blank or use 'Unknown'."),
      financialLoss: z.string().optional().describe("The estimated amount lost (RM) if applicable."),
    }),
    outputSchema: z.object({
      draftTemplate: z.string(),
      referenceId: z.string(),
    }),
  },
  async ({ incidentDetails, scammerContact, financialLoss }) => {
    console.log(`[Genkit Tool] Executing draftPoliceReport for ${scammerContact}`);
    return generatePoliceReportDraft({
      incidentDetails,
      scammerContact,
      financialLoss,
    });
  }
);
