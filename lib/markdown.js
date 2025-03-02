import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getEssaysFromSupabase, getEssayBySlugFromSupabase, searchEssaysFromSupabase } from './supabase';

// Only import fs and path on the server side
let fs;
let path;
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

// Define content directory only on server side
const getContentDirectory = () => {
  if (typeof window === 'undefined') {
    return path.join(process.cwd(), 'content');
  }
  return '';
};

export function getLocalEssaySlugs() {
  try {
    // This function should only be called on the server side
    if (typeof window !== 'undefined') {
      return [];
    }
    
    const contentDirectory = getContentDirectory();
    const essaysDir = path.join(contentDirectory, 'essays');
    if (!fs.existsSync(essaysDir)) {
      fs.mkdirSync(essaysDir, { recursive: true });
      return [];
    }
    return fs.readdirSync(essaysDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error getting local essay slugs:', error);
    return [];
  }
}

export function getLocalEssayBySlug(slug, fields = []) {
  try {
    // This function should only be called on the server side
    if (typeof window !== 'undefined') {
      return {};
    }
    
    const contentDirectory = getContentDirectory();
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = path.join(contentDirectory, 'essays', `${realSlug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return {};
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const items = {};

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
      if (field === 'slug') {
        items[field] = realSlug;
      }
      if (field === 'content') {
        items[field] = content;
      }
      
      // Fix for date serialization
      if (field === 'date') {
        if (data[field]) {
          // Ensure date is always a string
          items[field] = data[field] instanceof Date 
            ? data[field].toISOString() 
            : String(data[field]);
        }
      }
      // For all other fields
      else if (data[field]) {
        items[field] = data[field];
      }
    });

    return items;
  } catch (error) {
    console.error(`Error getting local essay by slug ${slug}:`, error);
    return {};
  }
}

export function getLocalAllEssays(fields = []) {
  try {
    // This function should only be called on the server side
    if (typeof window !== 'undefined') {
      return [];
    }
    
    const slugs = getLocalEssaySlugs();
    const essays = slugs
      .map((slug) => getLocalEssayBySlug(slug, fields))
      .filter(essay => Object.keys(essay).length > 0)
      // Sort essays by date in descending order
      .sort((essay1, essay2) => (essay1.date > essay2.date ? -1 : 1));
    return essays;
  } catch (error) {
    console.error('Error getting all local essays:', error);
    return [];
  }
}

/**
 * Gets all essays, preferably from Supabase
 * @param {Array} fields - Array of field names to include
 * @returns {Promise<Array>} Array of essays
 */
export async function getAllEssays(fields = []) {
  try {
    // Try to get essays from Supabase first
    const supabaseEssays = await getEssaysFromSupabase();
    
    // If we got essays from Supabase, return them
    if (supabaseEssays && supabaseEssays.length > 0) {
      // If specific fields were requested, filter the data
      if (fields.length > 0) {
        return supabaseEssays.map(essay => {
          const filteredEssay = {};
          fields.forEach(field => {
            if (essay[field] !== undefined) {
              filteredEssay[field] = essay[field];
            }
          });
          return filteredEssay;
        });
      }
      return supabaseEssays;
    }
    
    // Fall back to local essays if Supabase failed or returned no results
    console.warn('Falling back to local essays data');
    return getLocalAllEssays(fields);
  } catch (error) {
    console.error('Error fetching essays:', error);
    // Fall back to local essays in case of error
    return getLocalAllEssays(fields);
  }
}

/**
 * Gets a single essay by slug, preferably from Supabase
 * @param {string} slug - The slug of the essay to fetch
 * @param {Array} fields - Array of field names to include
 * @returns {Promise<Object>} The essay object
 */
export async function getEssayBySlug(slug, fields = []) {
  try {
    // Try to get the essay from Supabase first
    const supabaseEssay = await getEssayBySlugFromSupabase(slug);
    
    // If we got the essay from Supabase, return it
    if (supabaseEssay && Object.keys(supabaseEssay).length > 0) {
      // If specific fields were requested, filter the data
      if (fields.length > 0) {
        const filteredEssay = {};
        fields.forEach(field => {
          if (supabaseEssay[field] !== undefined) {
            filteredEssay[field] = supabaseEssay[field];
          }
        });
        return filteredEssay;
      }
      return supabaseEssay;
    }
    
    // Fall back to local essay if Supabase failed or returned no results
    console.warn(`Falling back to local data for essay with slug "${slug}"`);
    return getLocalEssayBySlug(slug, fields);
  } catch (error) {
    console.error(`Error fetching essay with slug "${slug}":`, error);
    // Fall back to local essay in case of error
    return getLocalEssayBySlug(slug, fields);
  }
}

export async function markdownToHtml(markdown) {
  try {
    const result = await remark()
      .use(html, { sanitize: false })
      .process(markdown);
    return result.toString();
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
}

/**
 * Searches essays by query, preferably from Supabase
 * @param {string} query - The search query
 * @returns {Promise<Array>} Array of matching essays
 */
export async function searchEssays(query) {
  try {
    // Try to search essays from Supabase first
    const supabaseResults = await searchEssaysFromSupabase(query);
    
    // If we got results from Supabase, return them
    if (supabaseResults && supabaseResults.length > 0) {
      return supabaseResults;
    }
    
    // Fall back to local search if Supabase failed or returned no results
    console.warn('Falling back to local essay search');
    return searchLocalEssays(query);
  } catch (error) {
    console.error('Error searching essays:', error);
    // Fall back to local search in case of error
    return searchLocalEssays(query);
  }
}

/**
 * Searches local essay files by query
 * @param {string} query - The search query
 * @returns {Array} Array of matching essays
 */
export function searchLocalEssays(query) {
  try {
    // This function should only be called on the server side
    if (typeof window !== 'undefined') {
      return [];
    }
    
    const essays = getLocalAllEssays(['title', 'slug', 'date', 'summary', 'content']);
    
    if (!query) {
      return essays;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    return essays.filter(essay => {
      const titleMatch = essay.title && essay.title.toLowerCase().includes(lowerCaseQuery);
      const contentMatch = essay.content && essay.content.toLowerCase().includes(lowerCaseQuery);
      const summaryMatch = essay.summary && essay.summary.toLowerCase().includes(lowerCaseQuery);
      
      return titleMatch || contentMatch || summaryMatch;
    });
  } catch (error) {
    console.error('Error searching local essays:', error);
    return [];
  }
} 