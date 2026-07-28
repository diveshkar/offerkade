import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next.js doesn't get confused by a stray
  // pnpm-lock.yaml in the home directory (multiple-lockfiles warning).
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    // Posting an offer sends the compressed poster + thumb through a Server
    // Action. The default 1MB limit can reject a large phone photo before it
    // reaches the handler (this is why posting failed on mobile). Raise it.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;

// Cloudflare dev bindings — load ONLY for local `next dev`. Vercel builds with
// plain `next build` and must not touch the Cloudflare adapter, so this is
// guarded to development and dynamically imported (skipped entirely on Vercel).
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch(() => {});
}
