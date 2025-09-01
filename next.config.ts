import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable static export for DigitalOcean App Platform
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
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

  // Disable telemetry
  telemetry: false,

  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Configure redirects for API routes
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-api-url.com/api/:path*', // Replace with your API URL
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
