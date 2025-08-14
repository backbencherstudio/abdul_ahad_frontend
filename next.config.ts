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
    ],
  },
};

export default nextConfig;
