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
  MessageCircle,
  BarChart3,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  Download,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { runOfflineAnalysis } from "@/lib/offline-shield";
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
  policeReport?: {
    referenceId: string;
    draftTemplate: string;
  };
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

    // LAYER 0: Offline Detection
    if (typeof window !== 'undefined' && !navigator.onLine) {
      console.log("[SoloFraud] Offline detected, using Local Heuristic Shield...");
      const offlineResult = runOfflineAnalysis(text);
      setResult(offlineResult);
      setAnalyzing(false);
      return;
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error("API Offline");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // Resilience Fallback: Use Local Heuristic Shield if API is unreachable
      const fallbackResult = runOfflineAnalysis(text);
      setResult(fallbackResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadExample = (example: string) => {
    setText(example);
    setResult(null);
  };

  const verdictConfig: Record<string, any> = {
    HIGH_RISK: { color: "#D53746", bg: "rgba(213,55,70,0.06)", icon: XCircle, label: "HIGH RISK", cardClass: "danger" },
    MEDIUM_RISK: { color: "#c9716e", bg: "rgba(201,113,110,0.06)", icon: AlertTriangle, label: "MEDIUM RISK", cardClass: "warning" },
    LOW_RISK: { color: "#5a9bb5", bg: "rgba(90,155,181,0.06)", icon: CheckCircle, label: "LOW RISK", cardClass: "safe" },
    SAFE: { color: "#5a9bb5", bg: "rgba(90,155,181,0.06)", icon: CheckCircle, label: "SAFE", cardClass: "safe" },
  };

  const getVerdictConfig = (v: string) => verdictConfig[v] || verdictConfig["LOW_RISK"];

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

        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: "#2c3e50" }}>
          Autonomous Agentic AI Against{" "}
          <span className="gradient-text">Digital Scams</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#6B7E8C", maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Paste any suspicious message — SMS, WhatsApp, email — and get an
          instant autonomous agentic analysis with actionable advice in seconds.
        </p>

        {/* Stats Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40, marginBottom: 48 }}>
          {[
            { value: "RM2.77B", label: "Lost to scams in 2025" },
            { value: "55,000+", label: "Cases reported annually" },
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
      <div className="analyzer-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card-static" style={{ padding: 28, height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 10, borderRadius: 14, background: "rgba(53,71,97,0.07)" }}>
                <Search size={22} style={{ color: "#354761" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Autonomous Agentic Analyzer</h2>
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
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "rgba(130,188,213,0.15)" }}
                  />
                  <Shield size={72} style={{ color: "#82BCD5", position: "relative" }} className="animate-pulse-shield" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Analyzing Message...</h3>
                <p style={{ fontSize: 14, color: "#9aabb8", textAlign: "center", maxWidth: 320, position: "relative" }}>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Running AI pattern matching, cross-referencing community reports, and checking known scam databases
                  </motion.span>
                </p>
                <div className="risk-meter" style={{ marginTop: 28, width: 280, height: 6, background: "rgba(53,71,97,0.05)", overflow: "hidden" }}>
                  <motion.div
                    className="risk-meter-fill"
                    style={{
                      background: "linear-gradient(90deg, transparent, #82BCD5, transparent)",
                      width: "60%",
                      position: "absolute",
                      height: "100%"
                    }}
                    animate={{ left: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
                className={`glass-card-static result-card ${getVerdictConfig(result.verdict).cardClass}`}
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
                      <span style={{ fontSize: 24, fontWeight: 800, color: getVerdictConfig(result.verdict).color }}>
                        {getVerdictConfig(result.verdict).label}
                      </span>
                      <span className="badge" style={{
                        background: getVerdictConfig(result.verdict).bg,
                        color: getVerdictConfig(result.verdict).color,
                        border: `1px solid ${getVerdictConfig(result.verdict).color}33`,
                      }}>
                        {(result.confidence <= 1.0 ? result.confidence * 100 : result.confidence).toFixed(1)}% confidence
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
                    {result.findings.map((f, i) => {
                      let Icon = Shield;
                      if (f.icon === "pattern") Icon = AlertTriangle;
                      if (f.icon === "network") Icon = Globe;
                      if (f.icon === "urgency") Icon = Activity;
                      if (f.icon === "shield") Icon = Shield;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: 14, borderRadius: 14,
                            background: f.severity === "high" ? "rgba(213,55,70,0.04)" : "rgba(53,71,97,0.03)",
                            border: `1px solid ${f.severity === "high" ? "rgba(213,55,70,0.1)" : "rgba(53,71,97,0.06)"}`
                          }}
                        >
                          <div style={{
                            padding: 8, borderRadius: 10,
                            background: f.severity === "high" ? "rgba(213,55,70,0.08)" : "rgba(53,71,97,0.05)"
                          }}>
                            <Icon size={16} style={{ color: f.severity === "high" ? "#D53746" : "#354761" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#354761" }}>{f.label}</div>
                            <p style={{ fontSize: 11, color: "#6B7E8C", marginTop: 2 }}>{f.detail}</p>
                          </div>
                        </motion.div>
                      );
                    })}
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

                {result.policeReport && (
                  <div
                    style={{
                      marginBottom: 24,
                      padding: 16,
                      borderRadius: 14,
                      background: "rgba(53,71,97,0.05)",
                      border: "1px solid rgba(53,71,97,0.12)",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#354761",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 10,
                      }}
                    >
                      Police report draft · Ref {result.policeReport.referenceId}
                    </h4>
                    <pre
                      style={{
                        fontSize: 12,
                        lineHeight: 1.55,
                        color: "#6B7E8C",
                        whiteSpace: "pre-wrap",
                        fontFamily: "ui-monospace, monospace",
                        margin: 0,
                        maxHeight: 280,
                        overflowY: "auto",
                      }}
                    >
                      {result.policeReport.draftTemplate}
                    </pre>
                  </div>
                )}

                <button
                  className="btn-secondary"
                  style={{ width: "100%", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  onClick={() => {
                    const conf = (result.confidence <= 1.0 ? result.confidence * 100 : result.confidence).toFixed(1);
                    const base = `SoloFraud Report\nVerdict: ${result.verdict}\nConfidence: ${conf}%\nType: ${result.scamType}\n\nFindings:\n${result.findings.map(f => `• ${f.label}: ${f.detail}`).join("\n")}\n\nAdvice:\n${result.advice.map(a => `• ${a}`).join("\n")}`;
                    const draft = result.policeReport
                      ? `\n\n--- Police report draft (${result.policeReport.referenceId}) ---\n${result.policeReport.draftTemplate}`
                      : "";
                    navigator.clipboard.writeText(base + draft);
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {[
            { icon: Search, title: "Scam Analyzer", desc: "Native Gemini 2.0 Flash engine analyzing SMS, WhatsApp, and email for social engineering.", color: "#354761", href: "/" },
            { icon: MessageCircle, title: "AI Advisor", desc: "Speak or type to your personal scam guardian with multi-lingual voice support.", color: "#6B7E8C", href: "/advisor" },
            { icon: BarChart3, title: "Threat Dashboard", desc: "Real-time national scam trends and community-driven threat intelligence.", color: "#D53746", href: "/dashboard" },
            { icon: Shield, title: "Heuristic Shield", desc: "Instant offline detection of common Malaysian scam signatures (TAC theft, bank alerts).", color: "#82BCD5", href: "/" },
            { icon: RefreshCw, title: "Rescue Shield", desc: "High-availability fallback orchestration ensures protection even during network outages.", color: "#5a9bb5", href: "/" },
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

      {/* ═══ Malaysia Fraud Landscape ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 6, color: "#2c3e50" }}>
          The Malaysian <span className="gradient-text-danger">Fraud Crisis</span>
        </h2>
        <p style={{ fontSize: 14, color: "#9aabb8", textAlign: "center", marginBottom: 36 }}>
          Real data, real urgency — why SoloFraud exists
        </p>
        <div className="security-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { year: "2024", loss: "RM1.57B", cases: "35,368", trend: "+28% from 2023", color: "#c9716e" },
            { year: "2025", loss: "RM2.77B", cases: "55,000+", trend: "+76% YoY", color: "#D53746" },
            { year: "2030 (Est.)", loss: "RM12B", cases: "150,000+", trend: "If unchecked", color: "#D53746" },
          ].map((stat) => (
            <div key={stat.year} className="glass-card-static" style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <TrendingUp size={60} style={{ position: "absolute", right: -8, bottom: -8, opacity: 0.03, color: stat.color }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9aabb8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{stat.year}</div>
              <div className="gradient-text-danger" style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{stat.loss}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7E8C", marginBottom: 4 }}>{stat.cases} cases</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{stat.trend}</div>
            </div>
          ))}
        </div>
        <div className="glass-card-static" style={{ marginTop: 20, padding: 20, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 28, textAlign: "center" }}>
          {[
            { label: "Malaysian digital literacy rate", value: "73%", note: "MCMC 2024" },
            { label: "Victims who didn't report", value: "62%", note: "Due to shame/complexity" },
            { label: "Average response time (current)", value: "4.2 hrs", note: "SoloFraud target: 3 sec" },
            { label: "Combined losses 2023-2025", value: "RM5.62B", note: "PDRM Official" },
          ].map((d) => (
            <div key={d.label} style={{ minWidth: 140 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#354761" }}>{d.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7E8C", marginTop: 2 }}>{d.label}</div>
              <div style={{ fontSize: 10, color: "#9aabb8", marginTop: 2 }}>{d.note}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══ Continuous Learning Loop ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 6, color: "#2c3e50" }}>
          Continuously <span className="gradient-text">Learning</span> AI
        </h2>
        <p style={{ fontSize: 14, color: "#9aabb8", textAlign: "center", marginBottom: 36 }}>
          Scammers evolve daily with AI — so does SoloFraud
        </p>
        <div className="glass-card-static" style={{ padding: 40 }}>
          <div className="learning-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
            {[
              { step: "1", icon: "📱", title: "Auto-Detect", desc: "System automatically intercepts and analyzes incoming suspicious messages" },
              { step: "2", icon: "🧠", title: "AI Analyzes", desc: "Our advanced models reason through the threat in real-time" },
              { step: "3", icon: "🗄️", title: "Report Stored", desc: "Verdict synced to Firebase national threat database" },
              { step: "4", icon: "🔄", title: "AI Re-grounds", desc: "Future scans informed by latest community reports" },
            ].map((item, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#82BCD5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step {item.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: "#9aabb8", lineHeight: 1.5 }}>{item.desc}</p>
                {i < 3 && <ChevronRight size={20} className="step-arrow" style={{ position: "absolute", right: -14, top: "40%", color: "#ddd" }} />}
              </div>
            ))}
          </div>
        </div>
      </motion.section>



      {/* ═══ Responsive overrides ═══ */}
      <style jsx>{`
        @media (max-width: 900px) {
          .learning-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .security-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .analyzer-grid {
            grid-template-columns: 1fr !important;
          }
          .learning-grid,
          .security-grid {
            grid-template-columns: 1fr !important;
          }
          .step-arrow {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
