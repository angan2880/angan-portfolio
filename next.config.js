/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [],
  },
  basePath: '/angan-portfolio',
  assetPrefix: '/angan-portfolio/',
}

module.exports = nextConfig 