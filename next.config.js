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
      '/search': { page: '/search' },
    };
    
    // Add a sample essay route
    // This is a static fallback since we can't dynamically get essays at config time
    pathMap['/essays/sample-essay'] = {
      page: '/essays/[slug]',
      query: { slug: 'sample-essay' }
    };
    
    return pathMap;
  },
  // Add the following option to fix issues with fonts
  experimental: {
    optimizeFonts: true,
  },
}

module.exports = nextConfig 