import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SoloFraud — AI-Powered Scam Protection for Malaysians",
  description:
    "Real-time AI protection against digital fraud, phishing, scam messages, and financial crimes. Powered by Google Gemini, Vertex AI, and community intelligence.",
  keywords: [
    "scam protection",
    "fraud detection",
    "Malaysia",
    "AI security",
    "phishing detector",
    "Google Gemini",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-gradient-mesh" />
        <Navbar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
