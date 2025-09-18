import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // add images support
  // output: "standalone",
  images: {
    domains: ["iss.bfginternational.com", "intranet.bfginternational.com"],
  },
};

export default nextConfig;
