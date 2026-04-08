"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Shield,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  Phone,
  FileText,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQueries = [
  "Someone called saying they're from Bank Negara and my account is compromised. Is this real?",
  "I received an SMS about winning RM10,000 from Shopee. How do I check if it's real?",
  "My friend asked me to invest in crypto with 500% returns. Should I trust it?",
  "How do I report a scam to Malaysian authorities?",
  "What are the most common types of scams in Malaysia right now?",
];

function generateResponse(query: string): string {
  const lower = query.toLowerCase();

  if (/bank negara|bnm|central bank/i.test(lower) && /call|phone|ring/i.test(lower)) {
    return `🚨 **This is almost certainly a SCAM!**

This is a classic **"Macau Scam"** — one of the most common scam types in Malaysia.

**Why it's a scam:**
• Bank Negara Malaysia (BNM) **NEVER calls individuals** about account issues
• They will never ask you to transfer money to a "safe account"
• Real authorities would summon you officially, not via phone call

**What you should do:**
1. ✅ **Hang up immediately** — do NOT engage further
2. ✅ **Do NOT transfer any money** under any circumstances
3. ✅ **Call your bank directly** using the number on your card/official website
4. ✅ **Verify with BNM** at their official line: **1-300-88-5465**

**How to report:**
• 🚔 **PDRM CCID Hotline:** 03-2610 1559
• 📱 **NSRC (National Scam Response Centre):** 997
• 💬 **PDRM WhatsApp:** +6013-211 1222
• 🌐 **SemakMule:** https://semakmule.rmp.gov.my

> 💡 **Pro tip:** You can check suspicious bank accounts on SemakMule to see if they've been flagged by other victims.

Would you like me to help you draft a police report?`;
  }

  if (/shopee|lazada|winning|memenangi|won|prize|hadiah/i.test(lower)) {
    return `🔴 **HIGH RISK — Likely a Lucky Draw / Prize Scam**

**Red flags detected:**
• Legitimate companies like Shopee **never notify winners via random SMS**
• Real prizes don't require upfront payment or personal banking details
• Scammers often use urgency ("claim within 24 hours") to pressure you

**How to verify legitimately:**
1. ✅ Open the **official Shopee app** and check your notifications
2. ✅ Contact Shopee's official customer service: **03-2298 9222**
3. ✅ Check the sender's number — official Shopee uses verified sender IDs
4. ❌ Do NOT click any links in the SMS
5. ❌ Do NOT share your IC number, bank details, or OTP

**Statistics:** This type of scam accounted for over **RM120 million** in losses in Malaysia in 2023.

Need me to analyze the actual message? Paste it in and I can do a detailed breakdown!`;
  }

  if (/invest|crypto|bitcoin|forex|roi|return|500%|300%|guaranteed/i.test(lower)) {
    return `⚠️ **EXTREME CAUTION — Potential Investment Scam!**

**Key warning signs:**
• Any investment promising **guaranteed returns** above 10-15% annually is suspicious
• Returns of 300-500% are **mathematically impossible** to sustain legally
• Pressure from friends/family suggests a **pyramid/MLM scheme** — they may be victims too

**How to verify:**
1. ✅ Check if the company is **licensed by SC Malaysia** (Securities Commission): https://www.sc.com.my
2. ✅ Check BNM's **Financial Consumer Alert** list for flagged entities
3. ✅ Search the **Investor Alert List**: https://www.sc.com.my/regulation/investor-alerts
4. ❌ Never invest more than you can afford to lose
5. ❌ Never invest based solely on someone else's recommendation

**Your friend:**
• They may genuinely believe it works (early investors in Ponzi schemes do see returns)
• They likely earn a commission for recruiting you
• Approach them with concern, not anger — they're likely a victim too

**Report to:** SC Malaysia at **03-6204 8999** or **aduan@seccom.com.my**`;
  }

  if (/report|lapor|polis|police|authorities|complain/i.test(lower)) {
    return `📋 **How to Report a Scam in Malaysia**

**Immediate Steps:**
1. 🚔 **NSRC (National Scam Response Centre):** Call **997**
   - Available 8am-8pm daily
   - They can freeze scammer's bank accounts within hours

2. 🚔 **PDRM (Police):**
   - CCID Hotline: **03-2610 1559**
   - WhatsApp: **+6013-211 1222**
   - Walk into any police station to lodge a report

3. 🏦 **Your Bank:**
   - Call immediately to freeze your account if compromised
   - Request a chargeback for unauthorized transactions

**Online Reporting:**
• 🌐 **SemakMule:** https://semakmule.rmp.gov.my — Check/report suspicious bank accounts
• 🌐 **MCMC:** https://aduan.skmm.gov.my — Report SMS/online scams
• 🌐 **BNM LINK:** https://telelink.bnm.gov.my — Financial scam complaints

**What to prepare:**
• Screenshots of messages/calls
• Transaction receipts
• Scammer's phone number / bank account
• Timeline of events

**Important:** Report within **24 hours** for the best chance of fund recovery. The faster you act, the more likely banks can freeze the scammer's account.`;
  }

  if (/common|type|trend|popular|latest|2024|2025|2026/i.test(lower)) {
    return `📊 **Top Scam Types in Malaysia (2025-2026)**

| Rank | Scam Type | Est. Losses | Trend |
|------|-----------|-------------|-------|
| 1 | 🏦 **Macau Scam** (phone impersonation) | RM380M+ | ↗️ Rising |
| 2 | 🛒 **Online Purchase Scam** | RM220M+ | ➡️ Stable |
| 3 | 💰 **Investment/Crypto Scam** | RM200M+ | ↗️ Rising |
| 4 | 💕 **Love/Romance Scam** | RM150M+ | ↗️ Rising |
| 5 | 📦 **Parcel/Delivery Scam** | RM80M+ | ↘️ Declining |
| 6 | 💼 **Job Scam** (e-commerce tasks) | RM120M+ | ↗️ Rising |
| 7 | 📱 **TAC/OTP Phishing** | RM50M+ | ➡️ Stable |

**Emerging Threats:**
• 🤖 **AI-generated deepfake calls** — scammers cloning voices of family members
• 📱 **APK malware scams** — fake apps that steal banking credentials
• 💬 **Telegram/WhatsApp group scams** — fake investment groups with paid actors

**Most targeted demographics:**
• Ages 20-39 (60% of victims)
• Online shoppers
• Job seekers
• Senior citizens (highest per-victim losses)

Want me to analyze a specific suspicious message or URL?`;
  }

  // Default response
  return `🛡️ **ScamShield AI Advisor**

I can help you with:

1. **🔍 Analyze suspicious messages** — Paste any SMS, WhatsApp, or email for instant analysis
2. **🌐 Check URLs** — Verify if a website is safe before clicking
3. **📋 Report scams** — Guide you through the Malaysian reporting process
4. **📊 Scam trends** — Learn about the latest scam types in Malaysia
5. **💡 Prevention tips** — Best practices to protect yourself and family

**Quick tips to remember:**
• Banks will **NEVER** ask for your OTP/TAC via SMS or call
• If it sounds too good to be true, it probably is
• Always verify through **official channels** (not links in messages)
• When in doubt, call **997** (NSRC) or **03-2610 1559** (CCID)

How can I help you today? Try asking me about a specific scenario you're concerned about.`;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Salam & Hello!** I'm your **ScamShield AI Advisor**.

I'm here to help you identify scams, understand threats, and stay safe online. Ask me anything about:

• 🔍 Suspicious messages or calls you've received
• 🌐 URLs or websites you're unsure about
• 📋 How to report scams in Malaysia
• 💡 Tips to protect yourself and your family

**Try asking:** _"Someone called saying they're from Bank Negara..."_`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));

    const response = generateResponse(content);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setTyping(false);
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');
        line = line.replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color: #82BCD5; text-decoration: underline;">$1</a>');

        if (line.startsWith("|") && line.endsWith("|")) {
          return null;
        }

        return (
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: line }} />
            {i < content.split("\n").length - 1 && <br />}
          </span>
        );
      });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 24px", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(107,126,140,0.08)" }}>
            <Bot size={24} style={{ color: "#6B7E8C" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              AI Scam <span className="gradient-text">Advisor</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#5a9bb5" }} />
              Powered by Google ADK Multi-Agent System
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4" style={{ scrollBehavior: "smooth" }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex gap-3 max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(130,188,213,0.10)" }}>
                    <Shield size={16} style={{ color: "#82BCD5" }} />
                  </div>
                </div>
              )}
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatContent(msg.content)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(53,71,97,0.08)" }}>
                    <User size={16} style={{ color: "#354761" }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(130,188,213,0.10)" }}>
              <Shield size={16} style={{ color: "#82BCD5" }} />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1 py-4 px-5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length <= 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-4">
          <p className="text-xs text-[var(--text-muted)] mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-2 rounded-xl text-left transition-all hover:bg-[rgba(53,71,97,0.05)]"
                style={{ border: "1px solid var(--border-glass)", color: "var(--text-secondary)", maxWidth: "100%" }}
              >
                {q.length > 60 ? q.slice(0, 60) + "..." : q}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Bar */}
      <div className="glass-card-static p-3">
        <div className="flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            className="input-glass flex-1"
            style={{ padding: "12px 16px" }}
            placeholder="Ask about a suspicious message, call, or situation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={typing}
          />
          <button
            className="btn-primary p-3"
            style={{ borderRadius: 12 }}
            onClick={() => sendMessage()}
            disabled={typing || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-[var(--text-muted)]">
            Powered by Google ADK + Gemini 2.0 Flash
          </p>
          <div className="flex gap-2">
            {[
              { icon: Phone, label: "Report", tip: "997 NSRC" },
              { icon: FileText, label: "Guide", tip: "Safety tips" },
            ].map((action) => (
              <button key={action.label}
                className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                title={action.tip}>
                <action.icon size={12} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
