import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable static export
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Configure for static export
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Skip API routes in static export
  exportPathMap: async () => ({
    '/': { page: '/' },
    // Add other static pages here
  }),
};

export default nextConfig;
