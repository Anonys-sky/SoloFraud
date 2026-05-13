import type { NextConfig } from "next";

/**
 * ScamShield Next.js Configuration
 * Optimized for Next.js 16.x + Turbopack
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  // Next.js 15+ uses these keys for ignoring errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
