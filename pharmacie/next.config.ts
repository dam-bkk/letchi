import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at letchi.damien.asia/pharmacie behind the hub (single DNS record).
  basePath: "/pharmacie",
  output: "standalone",
};

export default nextConfig;
