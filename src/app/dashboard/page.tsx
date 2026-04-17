"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import {
  BarChart3,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  MessageCircle,
  Phone,
  Banknote,
  Heart,
  ShoppingCart,
  Briefcase,
  Package,
  Smartphone,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  Flag,
  CheckCircle,
} from "lucide-react";

/* ───── Mock Data ───── */
const statsCards = [
  { label: "Total Reports", value: "39,247", change: "+12.4%", up: true, icon: Flag, color: "#354761", colorClass: "teal" },
  { label: "Scams Blocked", value: "28,103", change: "+18.7%", up: true, icon: Shield, color: "#82BCD5", colorClass: "blue" },
  { label: "Money Saved (Est.)", value: "RM4.2M", change: "+23.1%", up: true, icon: Banknote, color: "#6B7E8C", colorClass: "purple" },
  { label: "Active Threats", value: "1,847", change: "-8.3%", up: false, icon: AlertTriangle, color: "#D53746", colorClass: "red" },
];

const scamTypes = [
  { name: "Macau Scam", count: 12480, pct: 31.8, trend: "up", icon: Phone, color: "#D53746", losses: "RM380M" },
  { name: "Online Purchase", count: 8920, pct: 22.7, trend: "flat", icon: ShoppingCart, color: "#c9716e", losses: "RM220M" },
  { name: "Investment Scam", count: 6340, pct: 16.2, trend: "up", icon: TrendingUp, color: "#6B7E8C", losses: "RM200M" },
  { name: "Love/Romance", count: 4210, pct: 10.7, trend: "up", icon: Heart, color: "#F4A4B4", losses: "RM150M" },
  { name: "Job Scam", count: 3890, pct: 9.9, trend: "up", icon: Briefcase, color: "#82BCD5", losses: "RM120M" },
  { name: "Parcel/Delivery", count: 2180, pct: 5.6, trend: "down", icon: Package, color: "#354761", losses: "RM80M" },
  { name: "TAC/OTP Phishing", count: 1227, pct: 3.1, trend: "flat", icon: Smartphone, color: "#5a9bb5", losses: "RM50M" },
];

const MOCK_REPORTS = [
  { time: "2 min ago", type: "Macau Scam", status: "confirmed", detail: "+60 11-XXXX-4521 impersonating PDRM", location: "Kuala Lumpur" },
  { time: "8 min ago", type: "Phishing URL", status: "confirmed", detail: "maybank-secure-login.cc → credential harvest", location: "Selangor" },
  { time: "15 min ago", type: "Investment Scam", status: "investigating", detail: "GoldTradeX group promising 300% ROI", location: "Johor" },
  { time: "22 min ago", type: "Parcel Scam", status: "confirmed", detail: "Fake PosLaju customs payment RM12.90", location: "Penang" },
  { time: "31 min ago", type: "Love Scam", status: "investigating", detail: "Fake military profile targeting women 40+", location: "Sabah" },
  { time: "45 min ago", type: "Job Scam", status: "confirmed", detail: "E-commerce task scam, initial deposit RM300", location: "Perak" },
];

const stateData = [
  { state: "Kuala Lumpur", reports: 8420, pct: 21.5 },
  { state: "Selangor", reports: 7830, pct: 20.0 },
  { state: "Johor", reports: 4560, pct: 11.6 },
  { state: "Penang", reports: 3210, pct: 8.2 },
  { state: "Sarawak", reports: 2890, pct: 7.4 },
  { state: "Perak", reports: 2450, pct: 6.2 },
  { state: "Sabah", reports: 2180, pct: 5.6 },
  { state: "Others", reports: 7707, pct: 19.5 },
];

const hourlyData = [
  { hour: "12am", count: 45 }, { hour: "2am", count: 23 }, { hour: "4am", count: 12 },
  { hour: "6am", count: 34 }, { hour: "8am", count: 89 }, { hour: "10am", count: 156 },
  { hour: "12pm", count: 187 }, { hour: "2pm", count: 201 }, { hour: "4pm", count: 178 },
  { hour: "6pm", count: 223 }, { hour: "8pm", count: 267 }, { hour: "10pm", count: 198 },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [displayReports, setDisplayReports] = useState<any[]>(MOCK_REPORTS);
  const maxHourly = Math.max(...hourlyData.map(d => d.count));

  // 🏥 Real-time Listener for Firestore
  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to readable "X min ago"
        let timeStr = "Just now";
        if (data.timestamp instanceof Timestamp) {
          const seconds = Math.floor((Date.now() - data.timestamp.toMillis()) / 1000);
          if (seconds < 60) timeStr = "Just now";
          else if (seconds < 3600) timeStr = `${Math.floor(seconds / 60)} min ago`;
          else timeStr = `${Math.floor(seconds / 3600)} hr ago`;
        }

        return {
          id: doc.id,
          time: timeStr,
          type: data.scamType || "General Scam",
          status: data.status || "confirmed",
          detail: data.text?.substring(0, 80) + "..." || "No details available",
          location: data.location || "Malaysia",
          isLive: true
        };
      });

      // Merge live reports with original mock data to keep history full
      const combined = [...reports, ...MOCK_REPORTS].slice(0, 8);
      setDisplayReports(combined);
    }, (error) => {
      console.warn("Firestore listener fallback to mock data:", error);
      setDisplayReports(MOCK_REPORTS);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "80px 24px 100px", width: "100%", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(53,71,97,0.08)]">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl shadow-sm" style={{ background: "rgba(213,55,70,0.06)", border: "1px solid rgba(213,55,70,0.10)" }}>
                <BarChart3 size={24} style={{ color: "#D53746" }} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Threat <span className="gradient-text">Dashboard</span>
              </h1>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium max-w-xl">
              Real-time scam intelligence grounded in community reports. 
              Our AI monitors emerging vectors across all Malaysian states to provide preemptive defense.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-[rgba(53,71,97,0.04)] rounded-xl border border-[rgba(53,71,97,0.06)]">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: timeRange === range ? "white" : "transparent",
                    boxShadow: timeRange === range ? "0 2px 8px rgba(53,71,97,0.08)" : "none",
                    color: timeRange === range ? "#354761" : "var(--text-muted)",
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl animate-glow"
              style={{ background: "rgba(90,155,181,0.08)", border: "1px solid rgba(90,155,181,0.2)" }}>
              <span className="w-2.5 h-2.5 rounded-full animate-pulse-shield" style={{ background: "#5a9bb5" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#5a9bb5" }}>Live Threat Feed</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card-static stat-card ${stat.colorClass} p-6 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden`}
            >
              <Icon size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.03, color: stat.color }} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2.5 rounded-xl border" style={{ background: `${stat.color}08`, borderColor: `${stat.color}15` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider`}
                  style={{ background: stat.up ? "rgba(90,155,181,0.1)" : "rgba(213,55,70,0.1)", color: stat.up ? "#5a9bb5" : "#D53746" }}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-black mb-1.5 tracking-tight relative z-10">{stat.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] relative z-10">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card-static p-8 shadow-md">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                <Activity size={20} style={{ color: "#354761" }} />
                Scam Activity Velocity
              </h3>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 bg-black/5 rounded-full">
                Interval: 120min
              </div>
            </div>
            
            <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-none">
              <div className="flex items-end gap-3 md:gap-4 min-w-[600px] md:min-w-0" style={{ height: 180 }}>
                {hourlyData.map((d, i) => (
                  <motion.div
                    key={d.hour}
                    className="flex-1 flex flex-col items-center gap-2 group"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    style={{ transformOrigin: "bottom" }}
                  >
                    <div className="text-[9px] font-bold text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mb-1">{d.count}</div>
                    <div
                      className="w-full max-w-[32px] rounded-t-lg transition-all relative overflow-hidden"
                      style={{
                        height: `${(d.count / maxHourly) * 120}px`,
                        background: d.count > 200
                          ? "linear-gradient(180deg, #D53746, #c9716e)"
                          : d.count > 100
                          ? "linear-gradient(180deg, #c9716e, #82BCD5)"
                          : "linear-gradient(180deg, #82BCD5, #5a9bb5)",
                        minHeight: 6,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase mt-1">{d.hour}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Scam Types */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card-static p-8 shadow-md">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
              <Eye size={20} style={{ color: "#82BCD5" }} />
              Composition by Threat Type
            </h3>
            <div className="space-y-6">
              {scamTypes.map((scam, i) => {
                const Icon = scam.icon;
                return (
                  <motion.div
                    key={scam.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-5"
                  >
                    <div className="p-3 rounded-2xl border border-[var(--border-glass)]" style={{ background: `${scam.color}08` }}>
                      <Icon size={18} style={{ color: scam.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold truncate tracking-tight">{scam.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{scam.losses} Est. Loss</span>
                          <span className="text-sm font-black" style={{ color: scam.color }}>{scam.pct}%</span>
                        </div>
                      </div>
                      <div className="risk-meter" style={{ height: 6 }}>
                        <motion.div
                          className="risk-meter-fill"
                          style={{ background: scam.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${scam.pct}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 p-1.5 rounded-lg bg-[rgba(53,71,97,0.02)]">
                      {scam.trend === "up" && <TrendingUp size={16} style={{ color: "#D53746" }} />}
                      {scam.trend === "down" && <TrendingDown size={16} style={{ color: "#5a9bb5" }} />}
                      {scam.trend === "flat" && <span className="text-[var(--text-muted)] text-xs px-1">—</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card-static p-8 shadow-md">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-3">
                <Clock size={20} style={{ color: "#6B7E8C" }} />
                Real-Time Community Logs
              </h3>
              <div className="badge-info text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-[rgba(130,188,213,0.3)]">
                Auto-Refreshing
              </div>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {displayReports.map((report, i) => (
                  <motion.div
                    key={report.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl transition-all border border-transparent hover:border-[var(--border-glass)] hover:bg-[rgba(53,71,97,0.02)] bg-white/30"
                  >
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-black/5">
                      {report.status === "confirmed" ? (
                        <CheckCircle size={20} style={{ color: "#D53746" }} />
                      ) : (
                        <AlertTriangle size={20} style={{ color: "#c9716e" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold tracking-tight">{report.type}</span>
                        {report.isLive && (
                          <span className="text-[8px] font-black bg-[#5a9bb5] text-white px-1.5 py-0.5 rounded leading-none">LIVE</span>
                        )}
                        <span className={`badge ${report.status === "confirmed" ? "badge-danger" : "badge-warning"} text-[9px] font-black uppercase tracking-widest px-2 py-0.5`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate font-medium">{report.detail}</p>
                    </div>
                    <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-1 sm:gap-0">
                      <div className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin size={10} style={{ color: "#c9716e" }} />
                        {report.location}
                      </div>
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{report.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* State Heatmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card-static p-8 shadow-md">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
              <MapPin size={20} style={{ color: "#c9716e" }} />
              Regional Density
            </h3>
            <div className="space-y-4">
              {stateData.map((s, i) => (
                <div key={s.state}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-tight">{s.state}</span>
                    <span className="text-[11px] font-black text-[var(--text-primary)]" style={{ opacity: 0.8 }}>{s.reports.toLocaleString()}</span>
                  </div>
                  <div className="risk-meter" style={{ height: 6 }}>
                    <motion.div
                      className="risk-meter-fill"
                      style={{
                        background: s.pct > 15
                          ? "linear-gradient(90deg, #D53746, #c9716e)"
                          : s.pct > 8
                          ? "linear-gradient(90deg, #c9716e, #82BCD5)"
                          : "linear-gradient(90deg, #82BCD5, #5a9bb5)",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.pct / 22) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card-static p-8 shadow-md bg-white/40">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3 mb-8 pb-4 border-b border-black/5">
              <TrendingUp size={20} style={{ color: "#5a9bb5" }} />
              Agentic Insights
            </h3>
            <div className="space-y-4">
              {[
                { emoji: "🚨", text: "Macau scam calls surge 23% this week, primarily targeting Klang Valley residents aged 30-45", color: "#D53746" },
                { emoji: "📱", text: "New APK malware campaign detected — disguised as \"MySejahtera 2.0\" update via WhatsApp links", color: "#D53746" },
                { emoji: "💼", text: "Job scams on Telegram increased 45% — fake e-commerce task groups requiring RM300+ deposits", color: "#c9716e" },
                { emoji: "📈", text: "Crypto romance scams trending on Facebook Dating — targeting women aged 35-50 in East Malaysia", color: "#c9716e" },
                { emoji: "✅", text: "PosLaju parcel scam reports declined 18% following MCMC public awareness campaign", color: "#5a9bb5" },
              ].map((insight, i) => (
                <div key={i} className="group p-4 rounded-2xl border border-[var(--border-glass)] bg-white/60 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: `${insight.color}10` }}>
                      {insight.emoji}
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emergency Contacts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-card-static p-8 shadow-inner" style={{ border: '2px dashed var(--border-glass)', background: 'rgba(213,55,70,0.02)' }}>
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-3 mb-6">
              <Phone size={20} style={{ color: "#D53746" }} />
              Rapid Response
            </h3>
            <div className="space-y-3">
              {[
                { name: "NSRC (Scam Response)", number: "997", color: "#D53746", desc: "Mon-Sun, 8am-8pm" },
                { name: "PDRM CCID", number: "03-2610 1559", color: "#354761", desc: "WhatsApp Help" },
              ].map((contact) => (
                <div key={contact.name} className="flex flex-col p-4 rounded-2xl bg-white shadow-sm border border-black/5 hover:border-[rgba(213,55,70,0.3)] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{contact.name}</span>
                    <span className="text-lg font-black tracking-tight" style={{ color: contact.color }}>{contact.number}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{contact.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
