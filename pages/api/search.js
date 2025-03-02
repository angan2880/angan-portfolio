import { searchEssays } from '../../lib/markdown';

/**
 * API handler for searching essays
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export default async function handler(req, res) {
  try {
    // Get the search query from the request
    const { q } = req.query;
    
    if (!q) {
      // If no query provided, return all essays
      const allEssays = await searchEssays('');
      return res.status(200).json(allEssays);
    }
    
    // Search essays matching the query
    const results = await searchEssays(q);
    
    // Return the results
    res.status(200).json(results);
  } catch (error) {
    console.error('API search error:', error);
    res.status(500).json({ error: 'Error searching essays' });
  }
} 