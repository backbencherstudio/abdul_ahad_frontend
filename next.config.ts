import type { NextConfig } from "next";
const path = require("path");
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["date-fns/esm"] = path.resolve(
      __dirname,
      "node_modules/date-fns"
    );
    return config;
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "192.168.4.4",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.7.60",
        port: "4080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.7.12",
        port: "4080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "baseball-digit-system-livestock.trycloudflare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "varieties-richardson-honolulu-livecam.trycloudflare.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
