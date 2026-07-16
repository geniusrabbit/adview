const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@adview/react', '@adview/core'],
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
