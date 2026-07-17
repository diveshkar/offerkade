import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next.js doesn't get confused by a stray
  // pnpm-lock.yaml in the home directory (multiple-lockfiles warning).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
