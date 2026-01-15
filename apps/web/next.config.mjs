/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  reactStrictMode: true,
  // Note: 'output: "standalone"' is for Docker deployments
  // Vercel automatically handles Next.js builds, so this is ignored on Vercel
  ...(process.env.VERCEL ? {} : {
    output: "standalone",
    experimental: {
      outputFileTracingRoot: path.join(path.dirname(new URL(import.meta.url).pathname), "../.."),
    },
  }),
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