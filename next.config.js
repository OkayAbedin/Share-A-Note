/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint warnings during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Enable type checking during builds
    ignoreBuildErrors: false,
  },
  // Enable static optimization
  trailingSlash: false,
};

module.exports = nextConfig;
