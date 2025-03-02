import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Search() {
  return (
    <Layout title="Search" description="Search functionality coming soon">
      <div className="search-placeholder">
        <h1>Search Functionality</h1>
        <p>Search is currently unavailable in the static site version.</p>
        <p>Please check back later when this feature is implemented in a way compatible with static exports.</p>
        
        <div className="back-link">
          <Link href="/">
            ← Back to Home
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .search-placeholder {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        h1 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }
        
        p {
          margin-bottom: 1rem;
          color: #666;
        }
        
        .back-link {
          margin-top: 2rem;
        }
        
        .back-link a {
          color: inherit;
          text-decoration: none;
        }
        
        .back-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
} 