import path from "path";
import type { NextConfig } from "next";

// Baseline security headers applied to every route. These are deliberately
// conservative (no CSP yet: the inline pre-paint theme script in layout.tsx
// and the configurable backend origin would each need an allow-list entry).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // Pin the workspace root to this repo. Without it, Turbopack picks up a
  // stray lockfile in a parent directory (e.g. the user's home folder) as the
  // root, which breaks dynamic routes such as /departments/[departmentId].
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
