import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getAllEssays } from '../../lib/markdown';

export default function Essays({ allEssays }) {
  const [hoveredEssay, setHoveredEssay] = useState(null);

  const handleMouseEnter = (slug) => {
    console.log("Mouse entered:", slug);
    setHoveredEssay(slug);
  };

  const handleMouseLeave = () => {
    console.log("Mouse left");
    setHoveredEssay(null);
  };

  return (
    <Layout title="Essays" description="Essays by Angan Sarker">
      <div className="essays-container">
        <div className="essays-header">
          <div className="header-date">Date</div>
          <div className="header-title">Title</div>
        </div>
        
        <div className="header-divider"></div>
        
        {allEssays.length > 0 ? (
          <div className="essays-list">
            {allEssays.map((essay) => (
              <div 
                key={essay.slug}
                className={`essay-container ${hoveredEssay === essay.slug ? 'essay-hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(essay.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  href={`/essays/${essay.slug}`} 
                  className="essay-link"
                >
                  <div className="essay-row">
                    <div className="essay-date">
                      {formatDate(essay.date)}
                    </div>
                    <div className="essay-title">
                      {essay.title}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No essays found. Start writing!</p>
        )}
      </div>

      <style jsx>{`
        .essays-container {
          width: 100%;
          margin-top: 1rem;
        }
        
        .essays-header {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding-bottom: 0.75rem;
          margin-bottom: 0;
          align-items: baseline;
          color: #777;
          font-size: 1rem;
          padding-left: 0.75rem;
        }
        
        .header-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin-bottom: 15px;
          width: 100%;
        }
        
        .header-date, .header-title {
          font-weight: 400;
        }
        
        .essays-list {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .essay-container {
          margin-bottom: 3px;
          border-radius: 4px;
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
        }
        
        .essay-hovered {
          background-color: #e0e0e0 !important;
          border-left: 4px solid #666 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        
        .essay-link {
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
        }
        
        .essay-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding: 10px 15px;
          align-items: center;
          min-height: 44px;
        }
        
        .essay-date {
          font-size: 0.9rem;
          color: #666;
          display: flex;
          align-items: center;
        }
        
        .essay-title {
          font-size: 1rem;
          font-weight: 400;
          display: flex;
          align-items: center;
        }
        
        @media (max-width: 640px) {
          .essays-header, .essay-row {
            grid-template-columns: 100px 1fr;
          }
          
          .essay-date {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </Layout>
  );
}

// Helper function to format date as "DD MMM YYYY"
function formatDate(dateString) {
  const date = new Date(dateString);
  
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export async function getStaticProps() {
  const allEssays = await getAllEssays(['title', 'date', 'slug']);
  
  return {
    props: { allEssays },
    revalidate: 60, // Revalidate every 60 seconds
  };
} 