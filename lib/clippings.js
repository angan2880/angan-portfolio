import { getClippingsFromNotion, getClippingByIdFromNotion } from './notion';

// Local fallback data if Notion is unavailable
const localClippings = [
  {
    id: '1',
    title: 'Canadian Investment Accounts',
    url: 'https://moneyscope.ca/2024/03/01/episode-8-canadian-investment-accounts/',
    date: '2023-12-15',
    type: 'Podcast',
    why: 'This Podcast was very helpful for me to understand the difference between different types of investable accounts and how to best optimize the benefits available to Canadian residents. Very useful and practical advice that I reference whenever I have questions.'
  },
  {
    id: '2',
    title: 'A Visual Guide to Investment Returns',
    url: 'https://www.visualcapitalist.com/historical-stock-market-returns/',
    date: '2023-11-03',
    type: 'Visual Data',
    why: 'Beautifully visualizes long-term investment returns and helps contextualize market volatility within broader trends.'
  },
  {
    id: '3',
    title: 'Value Investing in the Age of AI',
    url: 'https://www.morningstar.com/articles/value-investing-ai-era',
    date: '2023-09-21',
    type: 'Research',
    why: 'Explores how traditional value investing methodologies are evolving in response to technological disruption and AI adoption.'
  }
];

/**
 * Returns all clippings, preferably from Notion
 * @param {number} limit - Optional number of items to return
 * @returns {Promise<Array>} Array of clippings
 */
export async function getAllClippings(limit) {
  try {
    const notionItems = await getClippingsFromNotion(limit);

    if (notionItems && notionItems.length > 0) {
      return notionItems;
    }

    console.warn('Falling back to local clippings data');
    const sortedItems = [...localClippings].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return limit ? sortedItems.slice(0, limit) : sortedItems;
  } catch (error) {
    console.error('Error fetching clippings:', error);
    const sortedItems = [...localClippings].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return limit ? sortedItems.slice(0, limit) : sortedItems;
  }
}

/**
 * Returns a single clipping by ID, preferably from Notion
 * @param {string} id - The ID of the item to fetch
 * @returns {Promise<Object|null>} The clipping or null if not found
 */
export async function getClippingById(id) {
  try {
    const notionItem = await getClippingByIdFromNotion(id);

    if (notionItem) {
      return notionItem;
    }

    console.warn(`Falling back to local data for clipping with ID "${id}"`);
    return localClippings.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error fetching clipping with ID "${id}":`, error);
    return localClippings.find(item => item.id === id) || null;
  }
}

// Expose local data for administrative purposes
export const getLocalClippings = () => localClippings;
