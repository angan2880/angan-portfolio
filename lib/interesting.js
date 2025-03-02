import { getInterestingItemsFromSupabase, getInterestingItemByIdFromSupabase } from './supabase';

// Collection of interesting items that can be used as fallback if Supabase connection fails
const localInterestingItems = [
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
 * Returns all interesting items, preferably from Supabase
 * @param {number} limit - Optional number of items to return
 * @returns {Promise<Array>} Array of interesting items
 */
export async function getAllInterestingItems(limit) {
  try {
    // First try to get data from Supabase
    const supabaseItems = await getInterestingItemsFromSupabase(limit);
    
    // If we got data from Supabase, return it
    if (supabaseItems && supabaseItems.length > 0) {
      return supabaseItems;
    }
    
    // If no data from Supabase, fall back to local data
    console.warn('Falling back to local interesting items data');
    const sortedItems = [...localInterestingItems].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return limit ? sortedItems.slice(0, limit) : sortedItems;
  } catch (error) {
    console.error('Error fetching interesting items:', error);
    // In case of error, fall back to local data
    const sortedItems = [...localInterestingItems].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return limit ? sortedItems.slice(0, limit) : sortedItems;
  }
}

/**
 * Returns a single interesting item by ID, preferably from Supabase
 * @param {string} id - The ID of the item to fetch
 * @returns {Promise<Object|null>} The interesting item or null if not found
 */
export async function getInterestingItemById(id) {
  try {
    // First try to get data from Supabase
    const supabaseItem = await getInterestingItemByIdFromSupabase(id);
    
    // If we got data from Supabase, return it
    if (supabaseItem) {
      return supabaseItem;
    }
    
    // If no data from Supabase, fall back to local data
    console.warn(`Falling back to local data for interesting item with ID "${id}"`);
    return localInterestingItems.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Error fetching interesting item with ID "${id}":`, error);
    // In case of error, fall back to local data
    return localInterestingItems.find(item => item.id === id) || null;
  }
}

// Expose local data for administrative purposes
export const getLocalInterestingItems = () => localInterestingItems; 