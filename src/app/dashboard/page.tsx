"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

/* ─── Mock Data ─── */
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

const recentReports = [
  { time: "2 min ago", type: "Macau Scam", source: "SMS", status: "confirmed", detail: "+60 11-XXXX-4521 impersonating PDRM", location: "Kuala Lumpur" },
  { time: "8 min ago", type: "Phishing URL", source: "WhatsApp", status: "confirmed", detail: "maybank-secure-login.cc → credential harvest", location: "Selangor" },
  { time: "15 min ago", type: "Investment Scam", source: "Telegram", status: "investigating", detail: "GoldTradeX group promising 300% ROI", location: "Johor" },
  { time: "22 min ago", type: "Parcel Scam", source: "SMS", status: "confirmed", detail: "Fake PosLaju customs payment RM12.90", location: "Penang" },
  { time: "31 min ago", type: "Love Scam", source: "Facebook", status: "investigating", detail: "Fake military profile targeting women 40+", location: "Sabah" },
  { time: "45 min ago", type: "Job Scam", source: "WhatsApp", status: "confirmed", detail: "E-commerce task scam, initial deposit RM300", location: "Perak" },
  { time: "1 hr ago", type: "TAC Phishing", source: "SMS", status: "confirmed", detail: "Fake CIMB alert requesting TAC code", location: "Melaka" },
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
  const maxHourly = Math.max(...hourlyData.map(d => d.count));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px", width: "100%", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl" style={{ background: "rgba(213,55,70,0.06)" }}>
                <BarChart3 size={22} style={{ color: "#D53746" }} />
              </div>
              <h1 className="text-2xl font-bold">
                Threat <span className="gradient-text">Dashboard</span>
              </h1>
            </div>
            <p className="text-sm text-[var(--text-muted)] ml-12">
              Real-time scam intelligence from community reports across Malaysia
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["24h", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: timeRange === range ? "rgba(53,71,97,0.08)" : "transparent",
                  border: `1px solid ${timeRange === range ? "rgba(53,71,97,0.18)" : "var(--border-glass)"}`,
                  color: timeRange === range ? "#354761" : "var(--text-muted)",
                }}
              >
                {range}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-3 px-3 py-2 rounded-lg"
              style={{ background: "rgba(90,155,181,0.08)", border: "1px solid rgba(90,155,181,0.15)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse-shield" style={{ background: "#5a9bb5" }} />
              <span className="text-xs font-medium" style={{ color: "#5a9bb5" }}>Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card-static stat-card ${stat.colorClass} p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${stat.color}12` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold`}
                  style={{ color: stat.up ? "#5a9bb5" : "#D53746" }}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card-static p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity size={16} style={{ color: "#354761" }} />
                Scam Activity Today
              </h3>
              <div className="text-xs text-[var(--text-muted)]">Reports per 2-hour window</div>
            </div>
            <div className="flex items-end gap-2" style={{ height: 140 }}>
              {hourlyData.map((d, i) => (
                <motion.div
                  key={d.hour}
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  style={{ transformOrigin: "bottom" }}
                >
                  <div className="text-[10px] text-[var(--text-muted)]">{d.count}</div>
                  <div
                    className="w-full rounded-t-md transition-all hover:opacity-80"
                    style={{
                      height: `${(d.count / maxHourly) * 100}px`,
                      background: d.count > 200
                        ? "linear-gradient(180deg, #D53746, rgba(213,55,70,0.3))"
                        : d.count > 100
                        ? "linear-gradient(180deg, #c9716e, rgba(201,113,110,0.3))"
                        : "linear-gradient(180deg, #82BCD5, rgba(130,188,213,0.3))",
                      minHeight: 4,
                    }}
                  />
                  <div className="text-[9px] text-[var(--text-muted)]">{d.hour}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scam Types Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card-static p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Eye size={16} style={{ color: "#82BCD5" }} />
              Scam Types Breakdown
            </h3>
            <div className="space-y-3">
              {scamTypes.map((scam, i) => {
                const Icon = scam.icon;
                return (
                  <motion.div
                    key={scam.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded-lg" style={{ background: `${scam.color}12` }}>
                      <Icon size={14} style={{ color: scam.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold truncate">{scam.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[var(--text-muted)]">{scam.losses}</span>
                          <span className="text-xs font-medium" style={{ color: scam.color }}>{scam.pct}%</span>
                        </div>
                      </div>
                      <div className="risk-meter" style={{ height: 5 }}>
                        <motion.div
                          className="risk-meter-fill"
                          style={{ background: scam.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${scam.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0">
                      {scam.trend === "up" && <TrendingUp size={14} style={{ color: "#D53746" }} />}
                      {scam.trend === "down" && <TrendingDown size={14} style={{ color: "#5a9bb5" }} />}
                      {scam.trend === "flat" && <span className="text-[var(--text-muted)] text-xs">—</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card-static p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Clock size={16} style={{ color: "#6B7E8C" }} />
              Recent Community Reports
              <span className="badge-info text-[10px] ml-auto">Live feed</span>
            </h3>
            <div className="space-y-2">
              {recentReports.map((report, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-[rgba(53,71,97,0.03)]"
                >
                  <div className="shrink-0 mt-0.5">
                    {report.status === "confirmed" ? (
                      <CheckCircle size={16} style={{ color: "#D53746" }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: "#c9716e" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold">{report.type}</span>
                      <span className={`badge ${report.status === "confirmed" ? "badge-danger" : "badge-warning"}`}
                        style={{ fontSize: 9, padding: "2px 6px" }}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{report.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin size={10} />
                      {report.location}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{report.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* State Heatmap */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card-static p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <MapPin size={16} style={{ color: "#c9716e" }} />
              Reports by State
            </h3>
            <div className="space-y-2.5">
              {stateData.map((s, i) => (
                <motion.div
                  key={s.state}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{s.state}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{s.reports.toLocaleString()}</span>
                  </div>
                  <div className="risk-meter" style={{ height: 4 }}>
                    <motion.div
                      className="risk-meter-fill"
                      style={{
                        background: s.pct > 15
                          ? "linear-gradient(90deg, #D53746, #c9716e)"
                          : s.pct > 8
                          ? "linear-gradient(90deg, #c9716e, #82BCD5)"
                          : "#82BCD5",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.pct / 22) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card-static p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: "#5a9bb5" }} />
              AI-Generated Insights
            </h3>
            <div className="space-y-3">
              {[
                { emoji: "🚨", text: "Macau scam calls surge 23% this week, primarily targeting Klang Valley residents aged 30-45", severity: "high" },
                { emoji: "📱", text: "New APK malware campaign detected — disguised as \"MySejahtera 2.0\" update via WhatsApp links", severity: "high" },
                { emoji: "💼", text: "Job scams on Telegram increased 45% — fake e-commerce task groups requiring RM300+ deposits", severity: "medium" },
                { emoji: "📈", text: "Crypto romance scams trending on Facebook Dating — targeting women aged 35-50 in East Malaysia", severity: "medium" },
                { emoji: "✅", text: "PosLaju parcel scam reports declined 18% following MCMC public awareness campaign", severity: "low" },
              ].map((insight, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(53,71,97,0.02)" }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{insight.emoji}</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emergency Contacts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-card-static p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Phone size={16} style={{ color: "#D53746" }} />
              Emergency Contacts
            </h3>
            <div className="space-y-2.5">
              {[
                { name: "NSRC (Scam Response)", number: "997", color: "#D53746" },
                { name: "PDRM CCID", number: "03-2610 1559", color: "#354761" },
                { name: "Bank Negara", number: "1-300-88-5465", color: "#82BCD5" },
                { name: "MCMC", number: "1-800-188-030", color: "#6B7E8C" },
              ].map((contact) => (
                <div key={contact.name} className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: "rgba(53,71,97,0.02)" }}>
                  <span className="text-xs text-[var(--text-secondary)]">{contact.name}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: contact.color }}>{contact.number}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
