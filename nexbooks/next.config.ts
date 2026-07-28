import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at letchi.damien.asia/books behind the hub (single DNS record).
  basePath: "/books",
  output: "standalone",
};

export default nextConfig;
