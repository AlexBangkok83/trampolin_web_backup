import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure proper production builds
  output: 'standalone',
  experimental: {
    // Enable server actions
    serverActions: { allowedOrigins: ['*'] },
    // Ensure proper module resolution
    esmExternals: 'loose',
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
