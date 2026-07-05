import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default.
  // Stellar SDK is CommonJS — Turbopack handles CJS natively, no special config needed.
  // Empty turbopack config silences the "webpack config but no turbopack config" error.
  turbopack: {},
  // Allow @stellar/stellar-sdk to be resolved in the App Router client bundle
  transpilePackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
