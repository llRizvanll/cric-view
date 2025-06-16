/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  experimental: {
    // Ensure proper static generation
    staticWorkerRequestDeduping: true,
  },
  // Ensure BUILD_ID is properly generated
  generateBuildId: async () => {
    // Use timestamp + random to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  },
  /* config options here */
};

module.exports = nextConfig; 