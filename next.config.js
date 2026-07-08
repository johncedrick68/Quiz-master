/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdfjs-dist ships a Node canvas dependency we don't need in the browser bundle
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
