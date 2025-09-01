import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable standalone mode to fix client reference manifest issues
  output: undefined,

  experimental: {
    // Enable server actions
    serverActions: { allowedOrigins: ['*'] },
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable TypeScript type checking during build (handled in CI)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Disable ESLint during build (handled in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
