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
};

export default nextConfig;