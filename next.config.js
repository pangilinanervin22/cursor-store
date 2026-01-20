/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // This is key for efficient containerization
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;

