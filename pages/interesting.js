import React, { useState } from 'react';
import Layout from '../components/Layout';
import { getAllInterestingItems } from '../lib/interesting';
import { supabase } from '../lib/supabase';

export default function InterestingPage({ interestingItems }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (id) => {
    setHoveredItem(id);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Format date as "DD MMM YYYY"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Layout title="Interesting Things" description="Collection of interesting things found online">
      <div className="interesting-container">
        <section className="intro-section">
          <h1>Stuff I Found Interesting on the Interwebs</h1>
          <p>A curated collection of articles, tools, videos, and resources that caught my attention.</p>
        </section>
        
        <div className="content-divider"></div>
        
        <div className="interesting-header">
          <div className="header-date">Date</div>
          <div className="header-title">Title</div>
          <div className="header-type">Type</div>
        </div>
        
        {interestingItems.length > 0 ? (
          <div className="content-list">
            {interestingItems.map((item) => (
              <div 
                key={item.id}
                className={`interesting-item ${hoveredItem === item.id ? 'item-hovered' : ''}`}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="item-link"
                >
                  <div className="item-row">
                    <div className="item-date">
                      {formatDate(item.date)}
                    </div>
                    <div className="item-title">
                      {item.title}
                    </div>
                    <div className="item-type">
                      {item.type}
                    </div>
                  </div>
                </a>
                
                {hoveredItem === item.id && (
                  <div className="item-why">
                    <strong>Why I found it interesting:</strong> {item.why}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No interesting items found. Start collecting!</p>
        )}
      </div>

      <style jsx>{`
        .interesting-container {
          max-width: 900px;
          margin: 0 auto;
          padding-top: 0;
        }
        
        .intro-section {
          margin-bottom: 2rem;
        }
        
        .intro-section h1 {
          font-size: 1.6rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-family: var(--font-heading);
          color: #333;
        }
        
        .intro-section p {
          font-size: 1rem;
          color: #666;
          max-width: 650px;
          line-height: 1.5;
        }
        
        .content-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 1.5rem 0;
          width: 100%;
        }
        
        .interesting-header {
          display: grid;
          grid-template-columns: 150px 1fr 120px;
          padding: 0 15px 10px;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .header-date, .header-title, .header-type {
          font-weight: 500;
        }
        
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .interesting-item {
          border-radius: 4px;
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
          margin-bottom: 3px;
        }
        
        .item-hovered {
          background-color: #f0f0f0;
          border-left: 4px solid #666;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .item-link {
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
        }
        
        .item-row {
          display: grid;
          grid-template-columns: 150px 1fr 120px;
          padding: 10px 15px;
          align-items: center;
          min-height: 44px;
        }
        
        .item-date {
          font-size: 0.9rem;
          color: #666;
          display: flex;
          align-items: center;
        }
        
        .item-title {
          font-size: 1rem;
          font-weight: 400;
          display: flex;
          align-items: center;
        }
        
        .item-type {
          font-size: 0.85rem;
          color: #555;
          background-color: #f0f0f0;
          padding: 2px 8px;
          border-radius: 12px;
          text-align: center;
          max-width: 100px;
        }
        
        .item-why {
          padding: 10px 15px 15px;
          margin-left: 150px;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #555;
          background-color: rgba(0,0,0,0.03);
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        
        @media (max-width: 640px) {
          .interesting-header, .item-row {
            grid-template-columns: 100px 1fr 90px;
          }
          
          .item-date {
            font-size: 0.8rem;
          }
          
          .item-type {
            font-size: 0.75rem;
            max-width: 80px;
          }
          
          .item-why {
            margin-left: 0;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const interestingItems = await getAllInterestingItems();

  return {
    props: { interestingItems }
  };
} 