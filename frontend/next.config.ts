import type { NextConfig } from "next";

const config: NextConfig = {
  output: process.env.STANDALONE === "1" ? "standalone" : undefined,
  experimental: { proxyClientMaxBodySize: "101mb" },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};
export default config;
