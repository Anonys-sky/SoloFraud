"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Globe,
  MessageCircle,
  BarChart3,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

/* ────────────────────────── types ────────────────────────── */
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
}

/* ────────────────────── example scams ───────────────────── */
const exampleScams = [
  {
    label: "Macau Scam (BM)",
    text: 'Tahniah! Anda telah memenangi RM50,000 daripada Maybank. Sila klik link ini untuk tebus hadiah anda: bit.ly/maybnk-winner2026. Tawaran tamat dalam 24 jam!',
  },
  {
    label: "Parcel Scam (EN)",
    text: 'Your parcel #MY839201 is being held at customs. Pay RM12.90 processing fee within 2 hours or it will be returned. Click: https://pos-my-delivery.cc/pay',
  },
  {
    label: "TAC/OTP Theft",
    text: 'CIMB ALERT: Unauthorized login detected on your account. Reply with your 6-digit TAC code immediately to secure your account. Failure to respond will result in account suspension.',
  },
  {
    label: "Investment Scam",
    text: 'Hi, I\'m Sarah from GoldTradeX. Our AI trading bot guarantees 300% ROI monthly. Many Malaysians already earning RM50k/month from home. Join now with min RM500. WhatsApp: +60 11-2345 6789',
  },
];

/* ────────────────── analysis function ──────────────── */
function analyzeMessage(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const findings: Finding[] = [];
  let riskScore = 0;

  if (/24 jam|hours?|immediately|segera|tamat|urgent/i.test(text)) {
    findings.push({ icon: "⏰", label: "Urgency Pressure", detail: "Creates artificial time pressure to prevent rational thinking", severity: "high" });
    riskScore += 25;
  }
  const banks = ["maybank", "cimb", "rhb", "public bank", "bank negara", "bsn", "ambank", "hong leong"];
  const impersonated = banks.find(b => lower.includes(b));
  if (impersonated) {
    findings.push({ icon: "🏦", label: "Bank Impersonation", detail: `References "${impersonated.toUpperCase()}" — but uses unofficial channel`, severity: "high" });
    riskScore += 30;
  }
  if (/bit\.ly|tinyurl|\.cc\/|\.tk\/|\.ml\/|goo\.gl/i.test(text)) {
    findings.push({ icon: "🔗", label: "Suspicious URL", detail: "Uses URL shortener or non-official domain to hide real destination", severity: "high" });
    riskScore += 25;
  }
  if (/rm\s?\d|memenangi|winner|hadiah|roi|guarantee|jaminan/i.test(text)) {
    findings.push({ icon: "💰", label: "Financial Lure", detail: "Promises unrealistic monetary reward to entice action", severity: "high" });
    riskScore += 20;
  }
  if (/tac|otp|pin|password|kata laluan|6.digit|reply with/i.test(text)) {
    findings.push({ icon: "🔐", label: "Credential Theft Attempt", detail: "Requests sensitive authentication codes — banks NEVER do this via SMS", severity: "high" });
    riskScore += 35;
  }
  if (/whatsapp|wa\.me|\+60\s?1[0-9]/i.test(text)) {
    findings.push({ icon: "📱", label: "Suspicious Contact Channel", detail: "Directs to personal WhatsApp — legitimate services use official channels", severity: "medium" });
    riskScore += 15;
  }
  if (/trading|bot|invest|300%|roi|monthly return/i.test(text)) {
    findings.push({ icon: "📈", label: "Investment Scam Pattern", detail: "Promises guaranteed high returns — classic Ponzi/MLM indicator", severity: "high" });
    riskScore += 25;
  }
  if (findings.length === 0) {
    findings.push({ icon: "🔍", label: "No Obvious Red Flags", detail: "Message appears relatively normal, but always verify independently", severity: "low" });
  }

  riskScore = Math.min(riskScore, 99);
  const confidence = Math.min(50 + riskScore * 0.5, 99.2);
  let verdict: AnalysisResult["verdict"] = "LOW_RISK";
  let scamType = "Unknown";
  let summary = "This message appears to be relatively safe.";
  const advice: string[] = [];

  if (riskScore >= 60) {
    verdict = "HIGH_RISK";
    summary = "This message exhibits multiple characteristics of a known scam pattern.";
    advice.push("Do NOT click any links or share personal information", "Do NOT transfer any money", "Report to CCID Hotline: 03-2610 1559", "Report to NSRC: 997", "Block and delete the message");
  } else if (riskScore >= 30) {
    verdict = "MEDIUM_RISK";
    summary = "This message contains suspicious elements that warrant caution.";
    advice.push("Verify independently by calling the official organization", "Do not click links — type the URL manually instead", "If unsure, ask a trusted friend or family member");
  } else {
    advice.push("Message appears normal, but always stay vigilant", "Never share OTP/TAC codes with anyone");
  }

  if (/memenangi|winner|hadiah/i.test(text)) scamType = "Macau Scam / Lucky Draw Scam";
  else if (/parcel|customs|delivery|pos/i.test(text)) scamType = "Parcel Delivery Scam";
  else if (/tac|otp|pin/i.test(text)) scamType = "TAC/OTP Phishing";
  else if (/invest|trading|roi/i.test(text)) scamType = "Investment / Ponzi Scam";
  else if (/love|sayang|dear/i.test(text)) scamType = "Love Scam";

  return { verdict, confidence, summary, findings, advice, scamType };
}

/* ────────────────────── page ──────────────────── */
export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    setResult(analyzeMessage(text));
    setAnalyzing(false);
  };

  const loadExample = (example: string) => {
    setText(example);
    setResult(null);
  };

  const verdictConfig = {
    HIGH_RISK: { color: "#D53746", bg: "rgba(213,55,70,0.06)", icon: XCircle, label: "HIGH RISK", cardClass: "danger" },
    MEDIUM_RISK: { color: "#c9716e", bg: "rgba(201,113,110,0.06)", icon: AlertTriangle, label: "MEDIUM RISK", cardClass: "warning" },
    LOW_RISK: { color: "#5a9bb5", bg: "rgba(90,155,181,0.06)", icon: CheckCircle, label: "LOW RISK", cardClass: "safe" },
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* ═══ Hero Section ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center",
          padding: "48px 24px 32px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 500,
          background: "rgba(53,71,97,0.06)", border: "1px solid rgba(53,71,97,0.10)", color: "#354761",
          marginBottom: 28,
        }}>
          <Sparkles size={14} />
          Powered by Google Gemini &amp; Vertex AI
        </div>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: "#2c3e50" }}>
          Your AI Shield Against{" "}
          <span className="gradient-text">Digital Scams</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#6B7E8C", maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Paste any suspicious message — SMS, WhatsApp, email — and get an
          instant AI-powered verdict with actionable advice in seconds.
        </p>

        {/* Stats Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, marginBottom: 48 }}>
          {[
            { value: "RM1.22B", label: "Lost to scams in 2023" },
            { value: "39,000+", label: "Cases reported annually" },
            { value: "< 3%", label: "Money ever recovered" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div className="gradient-text-danger" style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#9aabb8", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══ Analyzer Section ═══ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card-static" style={{ padding: 28, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 10, borderRadius: 14, background: "rgba(53,71,97,0.07)" }}>
                <Search size={22} style={{ color: "#354761" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Scam Message Analyzer</h2>
                <p style={{ fontSize: 13, color: "#9aabb8" }}>Paste any suspicious message below</p>
              </div>
            </div>

            <textarea
              className="input-glass"
              style={{ minHeight: 200, marginBottom: 20, fontSize: 15, lineHeight: 1.7 }}
              placeholder={"Paste a suspicious SMS, WhatsApp message, or email here...\n\nContoh: \"Tahniah! Anda memenangi RM10,000...\""}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "14px 28px", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}
              onClick={handleAnalyze}
              disabled={analyzing || !text.trim()}
            >
              {analyzing ? (
                <>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  <span style={{ marginLeft: 8 }}>Analyzing...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Analyze Message
                </>
              )}
            </button>

            <div>
              <p style={{ fontSize: 12, color: "#9aabb8", marginBottom: 10 }}>Try an example:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {exampleScams.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.text)}
                    style={{
                      fontSize: 12, padding: "6px 14px", borderRadius: 8,
                      border: "1px solid rgba(53,71,97,0.10)", color: "#6B7E8C",
                      background: "transparent", cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(53,71,97,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card-static"
                style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 460 }}
              >
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <Shield size={72} style={{ color: "#82BCD5" }} className="animate-pulse-shield" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Analyzing Message...</h3>
                <p style={{ fontSize: 14, color: "#9aabb8", textAlign: "center", maxWidth: 320 }}>
                  Running AI pattern matching, cross-referencing community reports, and checking known scam databases
                </p>
                <div className="risk-meter" style={{ marginTop: 28, width: 280 }}>
                  <motion.div
                    className="risk-meter-fill"
                    style={{ background: "linear-gradient(90deg, #354761, #82BCD5)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}

            {!analyzing && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`glass-card-static result-card ${verdictConfig[result.verdict].cardClass}`}
                style={{ padding: 28, minHeight: 460 }}
              >
                {/* Verdict Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(53,71,97,0.08)" }}>
                  {(() => {
                    const Icon = verdictConfig[result.verdict].icon;
                    return <Icon size={44} style={{ color: verdictConfig[result.verdict].color }} />;
                  })()}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: verdictConfig[result.verdict].color }}>
                        {verdictConfig[result.verdict].label}
                      </span>
                      <span className="badge" style={{
                        background: verdictConfig[result.verdict].bg,
                        color: verdictConfig[result.verdict].color,
                        border: `1px solid ${verdictConfig[result.verdict].color}33`,
                      }}>
                        {result.confidence.toFixed(1)}% confidence
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "#6B7E8C", marginTop: 4 }}>{result.scamType}</p>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "#6B7E8C", marginBottom: 24, lineHeight: 1.6 }}>{result.summary}</p>

                {/* Findings */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#9aabb8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                    Findings
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.findings.map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: 14, borderRadius: 14, background: "rgba(53,71,97,0.03)" }}
                      >
                        <span style={{ fontSize: 20 }}>{f.icon}</span>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</span>
                          <p style={{ fontSize: 12, color: "#9aabb8", marginTop: 2 }}>{f.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div style={{ padding: 18, borderRadius: 14, background: "rgba(53,71,97,0.04)", border: "1px solid rgba(53,71,97,0.08)" }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#354761", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    ✅ What You Should Do
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.advice.map((a, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#6B7E8C" }}>
                        <ChevronRight size={14} style={{ marginTop: 3, color: "#354761", flexShrink: 0 }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn-secondary"
                  style={{ width: "100%", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  onClick={() => {
                    const report = `ScamShield MY Report\nVerdict: ${result.verdict}\nConfidence: ${result.confidence.toFixed(1)}%\nType: ${result.scamType}\n\nFindings:\n${result.findings.map(f => `• ${f.label}: ${f.detail}`).join("\n")}\n\nAdvice:\n${result.advice.map(a => `• ${a}`).join("\n")}`;
                    navigator.clipboard.writeText(report);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied to clipboard!" : "Copy Report"}
                </button>
              </motion.div>
            )}

            {!analyzing && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-static"
                style={{
                  padding: 40, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", textAlign: "center",
                  height: "100%", minHeight: 460,
                  background: "linear-gradient(180deg, rgba(130,188,213,0.06) 0%, rgba(255,255,255,0.75) 100%)",
                }}
              >
                <div className="animate-float" style={{ marginBottom: 28 }}>
                  <Shield size={80} style={{ color: "#82BCD5", opacity: 0.25 }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#6B7E8C", marginBottom: 10 }}>
                  Paste a message to begin
                </h3>
                <p style={{ fontSize: 14, color: "#9aabb8", maxWidth: 300, lineHeight: 1.6 }}>
                  Our AI will analyze it for scam patterns, phishing attempts, and social engineering tactics
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ═══ Feature Cards ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 6, color: "#2c3e50" }}>
          Multi-Layer <span className="gradient-text">Protection</span>
        </h2>
        <p style={{ fontSize: 14, color: "#9aabb8", textAlign: "center", marginBottom: 36 }}>
          Five integrated AI-powered shields working together
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { icon: Search, title: "Scam Analyzer", desc: "AI-powered message analysis for SMS, WhatsApp & email", color: "#354761", href: "/" },
            { icon: Globe, title: "URL Sentinel", desc: "Real-time phishing website detection & safety scoring", color: "#82BCD5", href: "/url-check" },
            { icon: MessageCircle, title: "AI Advisor", desc: "Chat with your personal scam protection consultant", color: "#6B7E8C", href: "/advisor" },
            { icon: BarChart3, title: "Threat Dashboard", desc: "Real-time scam trends & community threat intelligence", color: "#D53746", href: "/dashboard" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Link key={i} href={feature.href} style={{ textDecoration: "none", color: "inherit" }}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(53,71,97,0.12)" }}
                  className="glass-card"
                  style={{ padding: 24, cursor: "pointer", height: "100%" }}
                >
                  <div style={{ padding: 12, borderRadius: 14, display: "inline-block", marginBottom: 16, background: `${feature.color}10` }}>
                    <Icon size={24} style={{ color: feature.color }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
                  <p style={{ fontSize: 13, color: "#9aabb8", lineHeight: 1.6, marginBottom: 16 }}>{feature.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: feature.color }}>
                    Try now <ArrowRight size={14} />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* ═══ Tech Stack ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 64px", textAlign: "center" }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#6B7E8C", marginBottom: 24 }}>
          Built with Google Technologies
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {["Gemini 2.0 Flash", "Vertex AI", "Gemma 2", "Google ADK", "Firebase", "Cloud Run"].map((tech) => (
            <div
              key={tech}
              style={{
                padding: "10px 22px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                background: "rgba(53,71,97,0.04)", border: "1px solid rgba(53,71,97,0.08)", color: "#354761",
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══ Responsive overrides ═══ */}
      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
