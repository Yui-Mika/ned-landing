import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The old Vite prototype in ned-landing/ has its own lockfile; pin the workspace root to this folder.
  turbopack: { root: __dirname },
};

export default nextConfig;
