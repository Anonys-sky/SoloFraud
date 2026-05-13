/**
 * Shared NSRC-style police report draft (used by Genkit tool + analyzer + advisor fallback).
 */
export type PoliceReportDraft = {
  draftTemplate: string;
  referenceId: string;
};

export async function generatePoliceReportDraft(input: {
  incidentDetails: string;
  scammerContact?: string;
  financialLoss?: string;
}): Promise<PoliceReportDraft> {
  const { incidentDetails, scammerContact, financialLoss } = input;
  await new Promise((r) => setTimeout(r, 350));

  const timestamp = new Date().toISOString().split("T")[0];
  const reportRef = `NSRC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, "0")}`;

  const draft = `
**[OFFICIAL INITIAL REPORT DRAFT - NSRC]**
Reference No: ${reportRef}
Date: ${timestamp}

**1. Incident Summary:**
${incidentDetails.trim()}

**2. Scammer Information:**
Contact/Handle: ${scammerContact?.trim() || "Unknown"}

**3. Financial Impact:**
Reported Loss: ${financialLoss ? `RM ${financialLoss}` : "None / Unspecified"}

**4. Complainant statement:**
I wish to lodge this report regarding the above incident and request appropriate action.

**Action required:**
Bring this draft to the nearest police station or submit via the NSRC portal (**997**) / PDRM e-reporting channels. Do not send money or share OTP/TAC with anyone claiming to be Bank Negara or your bank.
`.trim();

  return { draftTemplate: draft, referenceId: reportRef };
}
