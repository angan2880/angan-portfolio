import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllEssays } from '../lib/markdown';
import { getAllInterestingItems } from '../lib/interesting';

export default function Home({ recentEssays, interestingItems }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = (id) => {
    if (!isMobile) {
      setHoveredItem(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredItem(null);
    }
  };

  // For mobile: toggle item details on tap
  const handleItemClick = (e, id) => {
    if (isMobile) {
      e.preventDefault(); // Prevent navigation on first tap
      
      if (hoveredItem === id) {
        // If already open, allow the link to work normally on second tap
        setHoveredItem(null);
        return true; 
      } else {
        // Open this item
        setHoveredItem(id);
        return false;
      }
    }
    return true;
  };

  // Function to format date as "DD MMM YYYY"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Layout>
      <div className="home-container">
        <section className="bio-section">
          <p className="bio-text">
            I spend my time researching markets, analyzing investment opportunities, and thinking about the frameworks that drive financial decision-making. I'm particularly interested in how quantitative models and strategic insights intersect to create an edge in portfolio management and broader economic trends. My approach is a blend of deep research, structured thinking, and curiosity about market inefficiencies.
          </p>
          <p className="bio-text">
            Outside of work, I'm learning Spanish, pushing myself in long-distance cycling, and diving into quantum computing. Cycling challenges me both physically and mentally, Spanish expands my perspective, and quantum computing intrigues me with its potential to reshape complex problem-solving. I enjoy taking on difficult, high-leverage challenges that force me to grow.
          </p>
        </section>

        <div className="content-divider"></div>

        <section className="content-section">
          <div className="section-header">
            <h2>Recent Essays</h2>
            <Link href="/essays" className="section-link">
              all essays →
            </Link>
          </div>
          
          {recentEssays && recentEssays.length > 0 ? (
            <div className="content-list">
              {recentEssays.map((essay) => (
                <div 
                  key={essay.slug} 
                  className="essay-item"
                >
                  <Link href={`/essays/${essay.slug}`} className="item-link">
                    <div className="item-row">
                      <div className="item-date">
                        {formatDate(essay.date)}
                      </div>
                      <div className="item-title">
                        {essay.title}
                      </div>
                    </div>
                  </Link>
                  {essay.summary && (
                    <div className="item-summary">
                      {essay.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No essays found.</p>
          )}
        </section>
        
        <div className="content-divider"></div>
        
        <section className="content-section">
          <div className="section-header">
            <h2>Interesting Things</h2>
            <Link href="/interesting" className="section-link">
              all interesting things →
            </Link>
          </div>
          
          {interestingItems && interestingItems.length > 0 ? (
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
                    onClick={(e) => hoveredItem === item.id || !isMobile ? true : handleItemClick(e, item.id)}
                  >
                    <div className="item-row">
                      <div className="item-date">
                        {formatDate(item.date)}
                      </div>
                      <div className="item-title">
                        {item.title}
                        {isMobile && hoveredItem === item.id && 
                          <div className="mobile-hint">Tap again to open →</div>
                        }
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
            <p className="empty-message">No interesting items found.</p>
          )}
        </section>
        
        <div className="content-divider"></div>
      </div>

      <style jsx>{`
        .home-container {
          padding-top: 0;
          max-width: 900px;
          margin: 0 auto;
        }

        .cover-image-container {
          margin-bottom: 1.5rem;
        }
        
        .bio-section {
          margin: 0 0 2.5rem;
          padding: 1rem 0;
          border-left: none;
        }
        
        .bio-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #333;
          margin-bottom: 1rem;
        }
        
        .bio-text:last-child {
          margin-bottom: 0;
        }
        
        .content-divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 2.5rem 0;
          width: 100%;
        }
        
        .content-section {
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.75rem;
        }
        
        .section-header h2 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: #444;
        }
        
        .section-link {
          font-size: 0.9rem;
          color: #666;
          text-decoration: none;
        }
        
        .section-link:hover {
          text-decoration: underline;
        }
        
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        /* Common styles for both essay and interesting items */
        .essay-item, .interesting-item {
          border-radius: 4px;
          border-left: 4px solid transparent;
          transition: all 0.2s ease;
          margin-bottom: 3px;
        }
        
        .essay-item:hover, .item-hovered {
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
          grid-template-columns: 120px 1fr auto;
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
          font-size: 0.9rem;
          color: #666;
          display: flex;
          align-items: center;
          margin-left: 1rem;
        }
        
        .item-summary {
          padding: 0 15px 15px 152px;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #444;
        }
        
        .item-why {
          padding: 10px 15px 15px;
          margin-left: 120px;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #555;
          background-color: rgba(0,0,0,0.03);
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        
        .empty-message {
          color: #666;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
            padding: 12px 15px;
            gap: 0.25rem;
          }
          
          .item-date {
            margin-bottom: 0.25rem;
          }
          
          .item-summary {
            padding: 0 15px 15px;
          }
          
          .item-why {
            margin-left: 0;
          }
          
          .item-type {
            margin-left: 0;
          }
        }

        .mobile-hint {
          font-size: 0.8rem;
          color: #999;
          margin-top: 3px;
          font-style: italic;
          display: none;
        }
        
        @media (max-width: 640px) {
          .mobile-hint {
            display: block;
          }
          
          .item-why {
            margin-left: 0;
          }
          
          /* Add visual indication for tap interaction */
          .interesting-item {
            position: relative;
          }
          
          .interesting-item::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.03);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
          }
          
          .interesting-item:active::after {
            opacity: 1;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const recentEssays = await getAllEssays(['title', 'date', 'slug', 'summary']);
  const interestingItems = await getAllInterestingItems(3);
  
  return {
    props: {
      recentEssays: recentEssays.slice(0, 3),
      interestingItems,
    },
  };
} 