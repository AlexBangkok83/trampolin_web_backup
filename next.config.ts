import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable standalone mode to fix client reference manifest issues
  output: undefined,

  // Configure server components
  serverExternalPackages: [],

  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['*'],
    },
    // Enable server components (not needed in latest Next.js as it's enabled by default)
    // serverComponentsExternalPackages has been moved to root level
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Disable TypeScript type checking during build (handled in CI)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Disable ESLint during build (handled in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable source maps in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
