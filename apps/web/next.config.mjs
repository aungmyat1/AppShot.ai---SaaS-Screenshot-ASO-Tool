/** @type {import('next').NextConfig} */
import path from "path";
// Validate environment variables at build time
import "@getappshots/config";
// Note: Server-side env validation (lib/env.ts) runs when imported by application code
// We don't import it here because next.config.mjs can't import TypeScript files directly

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(path.dirname(new URL(import.meta.url).pathname), "../.."),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "is1-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is2-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is3-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is4-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is5-ssl.mzstatic.com" },
      { protocol: "https", hostname: "play-lh.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;

