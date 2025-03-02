import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // Try to fetch data from Supabase
  try {
    // Test the Supabase connection
    const { data: items, error } = await supabase
      .from('interesting_items')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        message: 'Error connecting to Supabase',
        hints: [
          'Check your Supabase URL and API key in .env.local',
          'Ensure Row Level Security (RLS) is configured properly',
          'Verify the interesting_items table exists'
        ],
        env: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          // Show just first few characters of the key for security
          supabaseKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
            ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...' 
            : undefined
        }
      });
    }
    
    // If successful, return the data
    return res.status(200).json({ 
      success: true, 
      data: items,
      message: 'Successfully connected to Supabase',
      count: items.length
    });
    
  } catch (err) {
    console.error('Exception when testing Supabase:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      message: 'Exception when testing Supabase connection'
    });
  }
} 