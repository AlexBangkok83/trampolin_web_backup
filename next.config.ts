/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for DigitalOcean App Platform
  output: 'export',

  // Set custom output directory
  distDir: '.next/static',

  // Configure images for static export
  images: {
    unoptimized: true,
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
