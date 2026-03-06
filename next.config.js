/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [],
  },
  basePath: process.env.NODE_ENV === 'development' ? '' : '/angan-portfolio',
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : '/angan-portfolio/',

  // Let Next.js auto-discover all paths via getStaticPaths
  exportPathMap: async function (defaultPathMap) {
    return defaultPathMap;
  },
  // Add the following option to fix issues with fonts
  experimental: {
    optimizeFonts: true,
  },
}

module.exports = nextConfig
