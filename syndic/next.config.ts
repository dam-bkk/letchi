import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at letchi.damien.asia/syndic behind the hub (single DNS record).
  basePath: "/syndic",
  output: "standalone",
};

export default nextConfig;
