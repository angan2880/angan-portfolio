import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { searchEssays } from '../lib/markdown';

export default function Search({ initialResults }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Navigate to search page with query parameter
      router.push({
        pathname: '/search',
        query: { q: query }
      }, undefined, { shallow: true });
      
      // Call the API endpoint to search essays
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Layout title="Search" description="Search for essays and content">
      <div className="page-header">
        <h1>Search</h1>
        <p className="subtitle">Find essays by title, content, or summary</p>
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for essays..."
            aria-label="Search query"
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      
      <div className="search-results">
        <h2>Results {query ? `for "${query}"` : ''}</h2>
        
        {isSearching ? (
          <p>Searching...</p>
        ) : results.length > 0 ? (
          <ul className="essay-list">
            {results.map((essay) => (
              <li key={essay.slug} className="essay-item">
                <h3 className="essay-title">
                  <Link href={`/essays/${essay.slug}`}>
                    {essay.title}
                  </Link>
                </h3>
                <p className="essay-date">
                  {new Date(essay.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {essay.summary && <p className="essay-summary">{essay.summary}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No essays found. Try a different search term.</p>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { q } = context.query;
  
  // If there's a query parameter, search for it
  const initialResults = q 
    ? await searchEssays(q) 
    : await searchEssays('');
  
  return {
    props: { initialResults },
  };
} 