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

// Makes Cloudflare bindings available in `next dev`.
// Note: OpenNext's *Worker preview* doesn't run on Windows, but `next dev`
// does - that's our local dev loop. Cloudflare builds on Linux, where the
// full adapter is supported.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
