import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable standalone mode to fix client reference manifest issues
  output: undefined,

  experimental: {
    // Disable React Server Components
    serverComponentsExternalPackages: [],
    // Enable server actions
    serverActions: { allowedOrigins: ['*'] },
  },

  // Disable React Strict Mode for better compatibility
  reactStrictMode: false,

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
