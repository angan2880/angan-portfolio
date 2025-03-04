/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [],
  },
  // basePath: '/angan-portfolio',
  // assetPrefix: '/angan-portfolio/',
  
  // Exclude specific pages from static export
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    // Create a new pathMap with only the pages we want to include
    const pathMap = {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/essays': { page: '/essays' },
      '/interesting': { page: '/interesting' },
    };
    
    // Add a sample essay route
    // This is a static fallback since we can't dynamically get essays at config time
    pathMap['/essays/sample-essay'] = {
      page: '/essays/[slug]',
      query: { slug: 'sample-essay' }
    };
    
    return pathMap;
  },
}

module.exports = nextConfig 