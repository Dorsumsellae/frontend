/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autonome (image Docker slim : node server.js).
  output: "standalone",
  reactStrictMode: true,
};

module.exports = nextConfig;
