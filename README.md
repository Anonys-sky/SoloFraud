<div align="center">
  <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f6e1_fe0f/512.webp" alt="SoloFraud Logo" width="120" />
  <h1>SoloFraud</h1>
  <p><strong>Your Sovereign AI Shield Against Digital Threats in Malaysia</strong></p>
  <p><i>Project 2030: MyAI Future Hackathon | Track 5: Secure Digital (FinTech & Security)</i></p>

  [![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
  [![Gemini](https://img.shields.io/badge/Gemini_2.0-Flash-blue?logo=google)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>


## 📖 Executive Summary

SoloFraud is a comprehensive, agentic AI-powered cybersecurity platform designed to protect Malaysians from the rapidly evolving landscape of digital fraud. Aligning directly with the **Malaysia Madani framework** and the **New Industrial Master Plan (NIMP) 2030**, we are transitioning Malaysia from a passive technology consumer to an active, sovereign technology creator.

With digital scams costing Malaysians over RM1.2 Billion annually, SoloFraud serves as a critical sovereign digital infrastructure, utilizing **Google Gemini 2.0 Flash** to provide real-time, low-latency protection layers including automated phishing URL detection, SMS/WhatsApp analysis, and autonomous legal advisory.


## 🎯 Problem Statement & Impact
In 2023 alone, over 39,000 scam cases were reported in Malaysia via CCID, resulting in massive financial hemorrhage. Existing solutions rely on static blacklists or delayed community reporting.

**Our Solution:** SoloFraud introduces an active-defense mechanism utilizing **Agentic AI Workflows**. It doesn't just passively read messages; it autonomously searches databases, reasons over threat intelligence, and executes real-world actions (such as drafting PDRM/NSRC police reports) to protect the user instantly.

## 🧠 Core Architecture (Agentic AI)

SoloFraud has completely transitioned from a static "Chat" interface to an **Autonomous Execution (Action)** model, strictly adhering to the technical mandate of the hackathon.

### The Stack
- **The Brain**: `Google Gemini 2.0 Flash` (Optimized for low-latency, rapid threat analysis).
- **The Orchestrator**: Agentic Function Calling / Tool Execution managed via Next.js serverless functions.
- **The Context**: Simulated Retrieval-Augmented Generation (RAG) using historical threat indicators and the national SemakMule database structure.

### Agentic Workflow Diagram
```mermaid
graph TD
    A[Suspicious Input (SMS/Call)] --> B[Agentic AI Router]
    B -->|Need Context| C{Function Calling Triggered}
    C -->|Lookup Required| D[(Mock SemakMule Database)]
    C -->|Action Required| E[Draft Official Police Report]
    D --> F[LLM Synthesis]
    E --> F
    F --> G[Actionable Dashboard & Output]
```

## ✨ Key Features

1. **Scam Analyzer:** A diagnostic pipeline that processes raw SMS/WhatsApp messages. It autonomously queries threat intelligence contexts before outputting a highly structured Risk Matrix (Verdict, Confidence, Findings).
2. **AI Advisor (Agentic Chat):** A sophisticated conversational agent that has access to local tools. If it detects a compromised bank account, it will autonomously invoke the `draftPoliceReport` action tool to generate NSRC-compliant documents.
3. **URL Sentinel:** Real-time domain verification assessing SSL, WHOIS, brand impersonation footprints, and Malaysian specific TLDs (.my).
4. **Threat Dashboard:** Real-time statistical dashboard mapping scam taxonomies, financial losses, and active threat clusters across Malaysian states.

## 🚀 Local Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/Anonys-sky/SoloFraud.git
cd SoloFraud

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Create a .env.local file in the root directory and add:
GEMINI_API_KEY="your_google_gemini_api_key"

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

## ⚖️ Declarations & Ethical Compliance

### AI Tool Disclosure
In accordance with the hackathon's zero-tolerance policy, the team officially declares the use of AI-assisted coding tools for the development of this project.
- **Code Generation:** GitHub Copilot and Google Gemini were used to accelerate boilerplate generation, CSS styling, and Next.js component structuring.
- **Core Logic:** We guarantee full comprehension of our codebase and are fully prepared to defend the Agentic orchestration, API routing, and component state management during evaluating rounds.

### Ethical/Responsible Use of AI
SoloFraud strictly adheres to Google's AI Principles. 
- **Privacy:** Message analysis occurs statistically; no Personally Identifiable Information (PII) is stored or retained. 
- **Bias:** The RAG prompt context is grounded purely in financial/technical realities (URLs, numbers), avoiding demographic profiling.

---
*Built with ❤️ for Malaysia. "Bridging the gap between theory and execution."*
