import type { Metadata, Viewport } from "next";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SoloFraud MY",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#354761",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <div className="bg-gradient-mesh" />
        <Navbar />
        <main className="relative z-10">{children}</main>
        {/* Emergency Cache Buster & Service Worker Purger */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var host = window.location.hostname;
                var isLocalDev = host === 'localhost' || host === '127.0.0.1';
                if (isLocalDev && 'serviceWorker' in navigator) {
                  navigator.serviceWorker
                    .getRegistrations()
                    .then(function (regs) {
                      regs.forEach(function (r) {
                        r.unregister();
                      });
                    })
                    .then(function () {
                      if (
                        navigator.serviceWorker.controller &&
                        !sessionStorage.getItem("ss_sw_dev_purge")
                      ) {
                        sessionStorage.setItem("ss_sw_dev_purge", "1");
                        window.location.reload();
                      }
                    });
                 // Detect if we need to purge
              if (!localStorage.getItem('ss_purge_v3')) {
                console.log('[SoloFraud] NUCLEAR PURGE: Clearing all localhost workers/caches...');
                
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => {
                    for (let reg of regs) reg.unregister();
                  });
                }
                
                if ('caches' in window) {
                  caches.keys().then(names => {
                    for (let name of names) caches.delete(name);
                  });
                }
                
                localStorage.clear();
                localStorage.setItem('ss_purge_v3', 'true');
                window.location.reload();
              }

              // Standard Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SoloFraud] New SW registered:', reg.scope); })
                    .catch(function(err) { console.warn('[SoloFraud] SW registration failed:', err); });
                });
              }
    });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
