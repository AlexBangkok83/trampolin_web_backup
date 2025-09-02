import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Configure external packages for server components
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
