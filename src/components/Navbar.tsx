"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, MessageCircle, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Analyzer", icon: Search },
  { href: "/advisor", label: "AI Advisor", icon: MessageCircle },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{ position: "relative", zIndex: 50, width: "100%" }}>
      <div className="glass-card-static" style={{
        margin: "12px 24px 0",
        padding: "10px 28px",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
          <div style={{ position: "relative" }}>
            <Shield style={{ width: 32, height: 32, color: "#354761" }} strokeWidth={2.2} />
          </div>
          <div>
            <span className="gradient-text" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
              SoloFraud
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9aabb8", marginLeft: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              MY
            </span>
          </div>
        </Link>

        {/* Desktop Nav (Centralized) */}
        <div className="hidden md:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Spacer (for balance) */}
        <div className="hidden md:block" style={{ width: 140 }}></div>


        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          style={{ padding: 8, color: "#6B7E8C", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card-static md:hidden"
            style={{ margin: "8px 24px 0", padding: 16 }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  style={{ display: "flex", marginBottom: 4 }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
