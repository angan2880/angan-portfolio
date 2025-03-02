import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging to help identify issues
console.log('Supabase URL:', supabaseUrl);
console.log('Using Supabase key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Please check your .env.local file.');
}

// Create the Supabase client with explicit options
export const supabase = createClient(
  supabaseUrl || 'https://fcklnwhqlxuqajiiogyo.supabase.co',
  supabaseAnonKey || 'fallback-key-that-wont-work',
  {
    auth: {
      persistSession: false,  // Don't persist session in browser storage
      autoRefreshToken: false // Don't auto refresh the token
    }
  }
);

// Test the connection on initialization and log the result
(async () => {
  try {
    const { data, error } = await supabase.from('interesting_items').select('count').single();
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase:', data);
    }
  } catch (err) {
    console.error('Exception when connecting to Supabase:', err);
  }
})();

/**
 * Fetches essays from Supabase, optionally limited by a number
 * @param {number} limit - Optional limit of essays to return
 * @returns {Promise<Array>} Array of essays
 */
export async function getEssaysFromSupabase(limit) {
  try {
    let query = supabase
      .from('essays')
      .select('*')
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching essays from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getEssaysFromSupabase:', error);
    return [];
  }
}

/**
 * Fetches a single essay by slug from Supabase
 * @param {string} slug - The slug of the essay to fetch
 * @returns {Promise<Object|null>} The essay object or null if not found
 */
export async function getEssayBySlugFromSupabase(slug) {
  try {
    const { data, error } = await supabase
      .from('essays')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error(`Error fetching essay with slug "${slug}" from Supabase:`, error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error(`Error in getEssayBySlugFromSupabase for slug "${slug}":`, error);
    return null;
  }
}

/**
 * Searches essays in Supabase based on query
 * @param {string} query - The search query
 * @returns {Promise<Array>} Array of matching essays
 */
export async function searchEssaysFromSupabase(query) {
  try {
    if (!query) {
      return getEssaysFromSupabase();
    }
    
    // Supabase full-text search with query in title, content, and summary
    const { data, error } = await supabase
      .from('essays')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error searching essays in Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchEssaysFromSupabase:', error);
    return [];
  }
}

/**
 * Fetches interesting items from Supabase, optionally limited by a number
 * @param {number} limit - Optional limit of items to return
 * @returns {Promise<Array>} Array of interesting items
 */
export async function getInterestingItemsFromSupabase(limit) {
  try {
    let query = supabase
      .from('interesting_items')
      .select('*')
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching interesting items from Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getInterestingItemsFromSupabase:', error);
    return [];
  }
}

/**
 * Fetches a single interesting item by ID from Supabase
 * @param {string} id - The ID of the item to fetch
 * @returns {Promise<Object|null>} The interesting item or null if not found
 */
export async function getInterestingItemByIdFromSupabase(id) {
  try {
    const { data, error } = await supabase
      .from('interesting_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching interesting item with ID "${id}" from Supabase:`, error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error(`Error in getInterestingItemByIdFromSupabase for ID "${id}":`, error);
    return null;
  }
} 