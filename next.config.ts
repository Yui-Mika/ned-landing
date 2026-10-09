import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The old Vite prototype in ned-landing/ has its own lockfile; pin the workspace root to this folder.
  turbopack: { root: __dirname },
  // No server source maps in the build: they would carry the dev-only harness source text into .next
  // (test hooks and the layout audit must never ship; CLAUDE.md "Dev-only test hooks").
  experimental: { serverSourceMaps: false },
};

export default nextConfig;
