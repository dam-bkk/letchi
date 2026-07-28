import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile exists in a parent directory; pin the workspace root
  // (PLATFORM.md Next 16 gotcha).
  turbopack: {
    root: __dirname,
  },
  output: "standalone",
};

export default nextConfig;
