/** @type {import('next').NextConfig} */
const { getAllEssays } = require('./lib/markdown');

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
    // Create a new pathMap with only the pages we want to include
    const pathMap = {
      '/': { page: '/' },
      '/about': { page: '/about' },
      '/essays': { page: '/essays' },
      '/interesting': { page: '/interesting' },
    };

    // Handle dynamic routes for essays
    try {
      // Add essay pages by getting all essay slugs
      const essays = await getAllEssays(['slug']);
      
      // Create a path mapping for each essay
      essays.forEach((essay) => {
        pathMap[`/essays/${essay.slug}`] = { 
          page: '/essays/[slug]', 
          query: { slug: essay.slug } 
        };
      });
    } catch (error) {
      console.error("Error adding essay routes to export map:", error);
      
      // Fallback to at least include a sample essay
      pathMap['/essays/sample-essay'] = {
        page: '/essays/[slug]',
        query: { slug: 'sample-essay' }
      };
    }
    
    return pathMap;
  },
}

module.exports = nextConfig 