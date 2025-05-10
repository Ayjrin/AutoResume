/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
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
  // Explicitly set the build directory
  distDir: '.next',
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
