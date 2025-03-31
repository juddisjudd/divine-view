// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: undefined,
      allowedOrigins: undefined,
    },
  },
  serverRuntimeConfig: {
    // Runtime configuration that is only available on the server side
  },
  publicRuntimeConfig: {
    // Runtime configuration that is available on both server and client side
  },
  images: {
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: 'https', hostname: '**.imgur.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createSecurityHeaders(),
      },
    ];
  },
};

function createSecurityHeaders() {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}

export default nextConfig;