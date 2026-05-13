"use client";

import { Shield, Phone, AlertTriangle, WifiOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * ScamShield Offline Safety Net Page
 * Provides emergency contacts and cached safety tips when phone is offline.
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px", textAlign: "center", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <WifiOff size={64} style={{ color: "#c9716e", margin: "0 auto 16px" }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          You&apos;re <span className="gradient-text">Offline</span>
        </h1>
        <p style={{ fontSize: 14, color: "#6B7E8C", lineHeight: 1.6 }}>
          SoloFraud&apos;s AI features require internet. But your safety information is cached locally.
        </p>
      </div>

      {/* Emergency Contacts */}
      <div className="glass-card-static" style={{ padding: 24, marginBottom: 20, textAlign: "left" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Phone size={18} style={{ color: "#D53746" }} /> Emergency Contacts
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { name: "NSRC Scam Response", number: "997", desc: "National Scam Response Centre" },
            { name: "PDRM CCID", number: "03-2610 1559", desc: "Commercial Crime Investigation" },
            { name: "Bank Negara BNMLINK", number: "1-300-88-5465", desc: "Financial fraud reporting" },
            { name: "MCMC Complaints", number: "1-800-888-030", desc: "Telecom & internet scams" },
          ].map((c) => (
            <a key={c.name} href={`tel:${c.number.replace(/[^0-9+]/g, "")}`}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 12, background: "rgba(213,55,70,0.04)",
                border: "1px solid rgba(213,55,70,0.1)", textDecoration: "none", color: "inherit" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#9aabb8" }}>{c.desc}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#D53746" }}>{c.number}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Cached Safety Tips */}
      <div className="glass-card-static" style={{ padding: 24, marginBottom: 20, textAlign: "left" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Shield size={18} style={{ color: "#354761" }} /> Quick Safety Tips
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Never share TAC/OTP codes with anyone — your bank will NEVER ask for them",
            "If a call claims to be PDRM/BNM, hang up and call 997 to verify",
            "Scam links often use domains like .cc, .tk, .xyz — always check the URL",
            "No legitimate prize requires upfront payment — it's always a scam",
            "Screenshot all evidence before blocking the scammer",
            "If money was sent, contact your bank IMMEDIATELY to freeze the transfer",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#6B7E8C", lineHeight: 1.5 }}>
              <AlertTriangle size={14} style={{ color: "#c9716e", flexShrink: 0, marginTop: 3 }} />
              {tip}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.location.reload()}
        className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <RefreshCw size={16} /> Try Reconnecting
      </button>
    </div>
  );
}
