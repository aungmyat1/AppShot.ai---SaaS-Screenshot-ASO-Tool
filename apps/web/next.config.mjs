/** @type {import('next').NextConfig} */
import path from "path";
// Note: Shared config validation removed because next.config.mjs can't reliably import 
// workspace packages in all deployment environments (Vercel, etc.)
// Server-side env validation (lib/env.ts) runs when imported by middleware

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

