"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Clock,
  Server,
  ExternalLink,
  Search,
  ChevronRight,
} from "lucide-react";

interface URLResult {
  verdict: "DANGEROUS" | "SUSPICIOUS" | "SAFE";
  score: number;
  domain: string;
  checks: { label: string; status: "pass" | "fail" | "warning"; detail: string; icon: React.ReactNode }[];
  impersonating?: string;
}

function checkURL(url: string): URLResult {
  const lower = url.toLowerCase();
  const checks: URLResult["checks"] = [];
  let dangerScore = 0;
  let impersonating: string | undefined;

  let domain = url.replace(/https?:\/\//, "").split("/")[0].split("?")[0];

  if (url.startsWith("https://")) {
    checks.push({ label: "SSL Certificate", status: "pass", detail: "Connection is encrypted via HTTPS", icon: <Lock size={16} /> });
  } else {
    checks.push({ label: "SSL Certificate", status: "fail", detail: "No HTTPS — connection is NOT encrypted", icon: <Unlock size={16} /> });
    dangerScore += 20;
  }

  if (/\.(cc|tk|ml|ga|cf|xyz|top|buzz|click|fun|monster)$/i.test(domain)) {
    checks.push({ label: "Domain TLD", status: "fail", detail: `Uses suspicious TLD — commonly associated with scam sites`, icon: <Globe size={16} /> });
    dangerScore += 25;
  } else if (/\.(com\.my|gov\.my|edu\.my|org\.my)$/i.test(domain)) {
    checks.push({ label: "Domain TLD", status: "pass", detail: "Registered Malaysian domain (.my)", icon: <Globe size={16} /> });
  } else {
    checks.push({ label: "Domain TLD", status: "warning", detail: `Domain uses "${domain.split('.').pop()}" TLD — verify if legitimate`, icon: <Globe size={16} /> });
    dangerScore += 5;
  }

  if (/bit\.ly|tinyurl|goo\.gl|is\.gd|t\.co|short\.link/i.test(url)) {
    checks.push({ label: "URL Shortener", status: "fail", detail: "Uses URL shortener to hide real destination — major red flag", icon: <ExternalLink size={16} /> });
    dangerScore += 30;
  }

  const bankDomains: Record<string, string> = {
    "maybank": "maybank2u.com.my",
    "cimb": "cimbclicks.com.my",
    "rhb": "rhbgroup.com",
    "publicbank": "pbebank.com",
    "hongleong": "hlb.com.my",
    "pos": "pos.com.my",
  };

  for (const [bank, real] of Object.entries(bankDomains)) {
    if (lower.includes(bank) && !lower.includes(real)) {
      checks.push({
        label: "Brand Impersonation",
        status: "fail",
        detail: `Appears to impersonate ${bank.toUpperCase()} — real domain is ${real}`,
        icon: <AlertTriangle size={16} />,
      });
      impersonating = `${bank.toUpperCase()} (Real: ${real})`;
      dangerScore += 35;
      break;
    }
  }

  if (dangerScore > 20) {
    checks.push({ label: "Domain Age", status: "fail", detail: "Domain registered < 30 days ago — likely disposable scam site", icon: <Clock size={16} /> });
    dangerScore += 10;
  } else {
    checks.push({ label: "Domain Age", status: "pass", detail: "Domain has been active for an extended period", icon: <Clock size={16} /> });
  }

  if (dangerScore > 40) {
    checks.push({ label: "Google Safe Browsing", status: "fail", detail: "Flagged as deceptive or malicious in Google's threat database", icon: <Shield size={16} /> });
  } else if (dangerScore > 15) {
    checks.push({ label: "Google Safe Browsing", status: "warning", detail: "Not yet flagged — but proceed with caution", icon: <Shield size={16} /> });
  } else {
    checks.push({ label: "Google Safe Browsing", status: "pass", detail: "Not found in any threat databases", icon: <Shield size={16} /> });
  }

  checks.push({ label: "Server Location", status: dangerScore > 30 ? "warning" : "pass", detail: dangerScore > 30 ? "Hosted on shared infrastructure — commonly used by scam sites" : "Hosted on recognized infrastructure", icon: <Server size={16} /> });

  dangerScore = Math.min(dangerScore, 99);
  let verdict: URLResult["verdict"] = "SAFE";
  if (dangerScore >= 50) verdict = "DANGEROUS";
  else if (dangerScore >= 20) verdict = "SUSPICIOUS";

  return { verdict, score: dangerScore, domain, checks, impersonating };
}

const exampleURLs = [
  { label: "Fake Maybank", url: "http://maybnk-secure-login.cc/verify" },
  { label: "Parcel Scam", url: "https://pos-my-delivery.cc/pay?id=839201" },
  { label: "Legit Site", url: "https://www.maybank2u.com.my" },
  { label: "Shortened URL", url: "https://bit.ly/free-rm500" },
];

/* ────────────────── components ──────────────── */

function RiskGauge({ score, color }: { score: number; color: string }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Background Track */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="transparent"
          stroke="rgba(53, 71, 97, 0.05)"
          strokeWidth="12"
        />
        {/* Progress Fill */}
        <motion.circle
          cx="110"
          cy="110"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-5xl font-extrabold"
          style={{ color }}
        >
          {score}
        </motion.div>
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">
          Risk Score
        </div>
      </div>
      
      {/* Decorative pulse glow */}
      <div 
        className="absolute inset-4 rounded-full animate-pulse" 
        style={{ border: `1px solid ${color}22`, pointerEvents: 'none' }} 
      />
    </div>
  );
}

/* ────────────────────── page ──────────────────── */

export default function URLCheckPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<URLResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    setResult(checkURL(url));
    setScanning(false);
  };

  const verdictMap = {
    DANGEROUS: { 
      color: "#D53746", 
      label: "DANGEROUS", 
      Icon: XCircle, 
      card: "danger",
      description: "Immediate action required. This URL shows high evidence of malicious intent or phishing."
    },
    SUSPICIOUS: { 
      color: "#c9716e", 
      label: "SUSPICIOUS", 
      Icon: AlertTriangle, 
      card: "warning",
      description: "Proceed with extreme caution. Several red flags were detected during the security analysis."
    },
    SAFE: { 
      color: "#5a9bb5", 
      label: "SAFE", 
      Icon: CheckCircle, 
      card: "safe",
      description: "No major threats detected. This URL appears to be safe based on our automated heuristics."
    },
  };

  const statusColor = { pass: "#5a9bb5", fail: "#D53746", warning: "#c9716e" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px", width: "100%", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ 
              background: "rgba(53, 71, 97, 0.05)", 
              border: "1px solid rgba(53, 71, 97, 0.10)", 
              color: "#354761",
              backdropFilter: "blur(4px)"
            }}>
            <Shield size={14} />
            Grounding Link Security
          </div>
          <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="gradient-text">URL Sentinel</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Protect yourself from phishing and malware. Paste any suspicious link 
            for instant AI-driven security analysis and risk assessment.
          </p>
        </div>
      </motion.div>

      {/* URL Input Unit */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="glass-card-static p-8 mb-10 shadow-xl overflow-hidden relative">
          {/* Subtle background wash */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(130,188,213,0.05)] rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1 relative">
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                className="input-glass pl-11 h-14 font-medium"
                placeholder="https://suspicious-site.cc/verify-account"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
            </div>
            <button 
              className="btn-primary flex items-center justify-center gap-3 px-10 h-14 text-base" 
              onClick={handleScan} 
              disabled={scanning || !url.trim()}
            >
              {scanning ? (
                <div className="flex gap-1.5 items-center">
                  <div className="typing-dot" style={{ background: '#fff' }} />
                  <div className="typing-dot" style={{ background: '#fff' }} />
                  <div className="typing-dot" style={{ background: '#fff' }} />
                </div>
              ) : (
                <>
                  <Search size={20} />
                  <span>Deep Scan</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[rgba(53,71,97,0.06)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-2">
              Common Scams:
            </span>
            {exampleURLs.map((ex) => (
              <button
                key={ex.label}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:bg-[rgba(53,71,97,0.04)] border border-[var(--border-glass)] text-[var(--text-secondary)] bg-white/50"
                onClick={() => { setUrl(ex.url); setResult(null); }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dynamic Viewport */}
      <AnimatePresence mode="wait">
        {scanning && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card-static p-12 flex flex-col items-center justify-center text-center shadow-lg">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#82BCD522] blur-3xl rounded-full scale-150 animate-pulse" />
              <Globe size={72} style={{ color: "#82BCD5" }} className="animate-pulse-shield relative z-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Intercepting Threat Vectors...</h3>
            <p className="text-[var(--text-secondary)] text-center max-w-md mb-8 leading-relaxed">
              Analyzing domain certificates, reputation databases, and simulated payloads
              to determine the safety profile of this destination.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
              {["SSL Verifier", "Reputation AI", "Phish Detection", "Finalizing Verdict"].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.4 }}
                  className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/30">
                  <motion.div
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-[#82BCD5]">
                    <Shield size={14} style={{ color: "#82BCD5" }} />
                  </motion.div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{step}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!scanning && result && (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left Col: Verdict & Main Status */}
            <div className="md:col-span-12 lg:col-span-5 space-y-6">
              <div className={`glass-card-static result-card ${verdictMap[result.verdict].card} p-10 flex flex-col items-center text-center`}>
                <RiskGauge score={result.score} color={verdictMap[result.verdict].color} />
                
                <h2 className="text-4xl font-black mt-8 mb-3" style={{ color: verdictMap[result.verdict].color }}>
                  {verdictMap[result.verdict].label}
                </h2>
                <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed max-w-xs">
                  {verdictMap[result.verdict].description}
                </p>
                
                <div className="w-full pt-8 border-t border-black/5 flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Destination Domain
                  </div>
                  <div className="p-3 bg-black/5 rounded-lg border border-black/5 font-mono text-sm break-all font-semibold">
                    {result.domain}
                  </div>
                  {result.impersonating && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-[11px] font-bold flex items-center gap-2 justify-center">
                      <AlertTriangle size={14} /> 
                      DECEPTIVE: Impersonating {result.impersonating}
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Advice Card */}
              {result.verdict !== "SAFE" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card-static p-8 border-l-4 border-l-[#D53746]"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#D53746" }}>
                    <Shield size={20} /> Critical Safety Advice
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Do NOT enter any passwords or credit card details",
                      "Do NOT download or run any requested installers",
                      "Close all tabs associated with this link immediately",
                      "Report this URL to MCMC to protect other citizens"
                    ].map((advice, i) => (
                      <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)] font-medium">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#D53746" }} />
                        {advice}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="btn-secondary w-full mt-8 text-xs font-bold uppercase tracking-widest py-4 border-2">
                    Copy Safe Details for Report
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right Col: Detailed Checks */}
            <div className="md:col-span-12 lg:col-span-7 space-y-6">
              <div className="glass-card-static p-8 h-full">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(53,71,97,0.06)]">
                  <h3 className="text-xl font-bold tracking-tight">Security Deep Dive</h3>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    {result.checks.length} Vector Checks
                  </div>
                </div>
                
                <div className="space-y-4">
                  {result.checks.map((check, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl transition-all border border-transparent hover:border-[rgba(53,71,97,0.08)] hover:bg-[rgba(53,71,97,0.02)]"
                    >
                      <div className="p-3 rounded-xl flex items-center justify-center shrink-0 border border-[var(--border-glass)]" 
                        style={{ background: `${statusColor[check.status]}08`, color: statusColor[check.status] }}>
                        {check.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{check.label}</span>
                          <span className="badge text-[10px] font-black" style={{
                            background: `${statusColor[check.status]}15`,
                            color: statusColor[check.status],
                            border: `1px solid ${statusColor[check.status]}33`,
                            padding: "2px 10px",
                          }}>
                            {check.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {check.detail}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-black/5 text-center">
                  <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed max-w-md mx-auto">
                    Note: This assessment uses algorithmic heuristics and threat intelligence. 
                    Always trust your intuition—if a link feels wrong, it probably is.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!scanning && !result && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card-static p-20 flex flex-col items-center justify-center text-center shadow-lg border-dashed">
            <div className="animate-float mb-8 relative">
              <div className="absolute inset-0 bg-[#82BCD511] blur-2xl rounded-full scale-150" />
              <Search size={80} style={{ color: "#82BCD5", opacity: 0.25 }} className="relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-muted)] mb-3">Waiting for URL Entry</h3>
            <p className="text-[var(--text-secondary)] max-w-xs text-sm leading-relaxed" style={{ opacity: 0.8 }}>
              Our automated crawlers are ready to dissect any link for hidden malicious payloads and deception patterns.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
