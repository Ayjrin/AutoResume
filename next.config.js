/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove standalone output for Vercel compatibility
  // output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'pdf-parse']
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Increase serverless function timeout and memory
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

// Enable bundle analyzer in analyze mode
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
