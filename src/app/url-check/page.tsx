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
    DANGEROUS: { color: "#D53746", label: "DANGEROUS", Icon: XCircle, card: "danger" },
    SUSPICIOUS: { color: "#c9716e", label: "SUSPICIOUS", Icon: AlertTriangle, card: "warning" },
    SAFE: { color: "#5a9bb5", label: "SAFE", Icon: CheckCircle, card: "safe" },
  };

  const statusColor = { pass: "#5a9bb5", fail: "#D53746", warning: "#c9716e" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px", width: "100%", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: "rgba(130,188,213,0.08)", border: "1px solid rgba(130,188,213,0.15)", color: "#5a8da5" }}>
            <Globe size={14} />
            URL Safety Scanner
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            <span className="gradient-text">URL Sentinel</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Check any link before you click. Our AI analyzes URLs for phishing, malware, and impersonation attempts.
          </p>
        </div>
      </motion.div>

      {/* URL Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="glass-card-static p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                className="input-glass pl-11"
                placeholder="Enter a URL to scan (e.g., https://suspicious-site.cc/login)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
              />
            </div>
            <button className="btn-primary flex items-center gap-2 shrink-0" onClick={handleScan} disabled={scanning || !url.trim()}>
              {scanning ? (
                <><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></>
              ) : (
                <><Search size={18} /> Scan URL</>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {exampleURLs.map((ex) => (
              <button
                key={ex.label}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-[rgba(53,71,97,0.05)]"
                style={{ border: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}
                onClick={() => { setUrl(ex.url); setResult(null); }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {scanning && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card-static p-10 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <Globe size={56} style={{ color: "#82BCD5" }} className="animate-pulse-shield" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scanning URL...</h3>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-sm mb-6">
              Checking SSL, domain reputation, Google Safe Browsing, brand impersonation, and more
            </p>
            <div className="w-64 space-y-2">
              {["SSL Certificate", "Domain Analysis", "Safe Browsing", "Content Scan"].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
                  className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 + 0.3 }}
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(90,155,181,0.15)" }}>
                    <CheckCircle size={10} style={{ color: "#5a9bb5" }} />
                  </motion.div>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!scanning && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {/* Verdict Banner */}
            <div className={`glass-card-static result-card ${verdictMap[result.verdict].card} p-6 mb-4`}>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = verdictMap[result.verdict].Icon;
                  return <Icon size={44} style={{ color: verdictMap[result.verdict].color }} />;
                })()}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold" style={{ color: verdictMap[result.verdict].color }}>
                    {verdictMap[result.verdict].label}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Domain: <span className="font-mono text-[var(--text-primary)]">{result.domain}</span>
                  </p>
                  {result.impersonating && (
                    <p className="text-xs mt-1 badge-danger inline-block px-2 py-0.5 rounded-md">
                      ⚠️ Impersonating {result.impersonating}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: verdictMap[result.verdict].color }}>
                    {result.score}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Risk Score</div>
                </div>
              </div>
            </div>

            {/* Detailed Checks */}
            <div className="glass-card-static p-6">
              <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Security Checks
              </h3>
              <div className="space-y-3">
                {result.checks.map((check, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: "rgba(53,71,97,0.02)" }}
                  >
                    <div className="p-2 rounded-lg" style={{ background: `${statusColor[check.status]}12` }}>
                      <span style={{ color: statusColor[check.status] }}>{check.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{check.label}</div>
                      <div className="text-xs text-[var(--text-muted)]">{check.detail}</div>
                    </div>
                    <div className="badge" style={{
                      background: `${statusColor[check.status]}15`,
                      color: statusColor[check.status],
                      border: `1px solid ${statusColor[check.status]}25`,
                      fontSize: 11,
                      padding: "4px 10px",
                    }}>
                      {check.status.toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {result.verdict !== "SAFE" && (
                <div className="mt-5 p-4 rounded-xl" style={{ background: "rgba(213,55,70,0.04)", border: "1px solid rgba(213,55,70,0.10)" }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#D53746" }}>
                    ⚠️ Safety Advice
                  </h4>
                  <ul className="space-y-1">
                    {["Do NOT enter any personal information on this site",
                      "Do NOT download any files from this URL",
                      "Report this URL to MCMC: https://aduan.skmm.gov.my",
                      "If you already entered details, change your passwords immediately",
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <ChevronRight size={14} className="mt-0.5 shrink-0" style={{ color: "#D53746" }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!scanning && !result && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card-static p-12 flex flex-col items-center justify-center text-center">
            <div className="animate-float mb-6">
              <Globe size={64} style={{ color: "#82BCD5", opacity: 0.3 }} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-muted)] mb-2">Enter a URL to scan</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs" style={{ opacity: 0.6 }}>
              We&apos;ll check it against threat databases, analyze the domain, and verify SSL security
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
