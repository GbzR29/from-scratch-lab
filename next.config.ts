import type { NextConfig } from "next";

// ── Security headers ──────────────────────────────────────────────────────────
// Sent on every response. The CSP only sets the directives that cannot break the
// site (no script-src yet: a nonce-based script policy comes with user login).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // Widgets use fullscreen and clipboard (left at their defaults); nothing else.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // ── Old URLs ──────────────────────────────────────────────────────────────
  // The courses lived under /learn on the author's portfolio (gabrielfrc.dev)
  // until 2026-10-18. The portfolio sends /learn/* here with the path intact;
  // these move it to the root.
  async redirects() {
    return [
      { source: "/learn", destination: "/", permanent: true },
      { source: "/learn/:path*", destination: "/:path*", permanent: true },
      { source: "/pt/learn", destination: "/pt", permanent: true },
      { source: "/pt/learn/:path*", destination: "/pt/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
