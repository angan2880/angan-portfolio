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
  
  // Exclude specific pages from static export
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    // Remove the search page from the export
    const pathMap = { ...defaultPathMap };
    delete pathMap['/search'];
    
    return pathMap;
  },
}

module.exports = nextConfig 