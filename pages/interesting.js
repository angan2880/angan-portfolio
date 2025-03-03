import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAllInterestingItems } from '../lib/interesting';
import { supabase } from '../lib/supabase';

export default function InterestingPage({ interestingItems }) {
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
        
        <h1>Stuff I Found Interesting on the Interwebs</h1>
        
        <p className="intro">
          A collection of articles, videos, and tools that caught my attention.
        </p>
        
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
                  onClick={(e) => hoveredItem === item.id || !isMobile ? true : handleItemClick(e, item.id)}
                >
                  <div className="item-row">
                    <div className="item-date">
                      {formatDate(item.date)}
                    </div>
                    <div className="item-title">
                      {item.title}
                      {isMobile && 
                        <div className="mobile-hint">
                          {hoveredItem === item.id ? 'Tap again to open →' : 'Tap to see why →'}
                        </div>
                      }
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
          width: 100%;
          margin-top: 1rem;
        }
        
        h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .intro {
          font-size: 1rem;
          color: #666;
          margin-bottom: 2rem;
        }
        
        .interesting-header {
          display: grid;
          grid-template-columns: 150px 1fr 120px;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          color: #888;
          padding: 0 15px 10px;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .interesting-item {
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
          will-change: transform, box-shadow, background-color, border-color;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .item-hovered {
          background-color: #f9f9f9;
          border-color: #ccc;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
          flex-direction: column;
          align-items: flex-start;
        }
        
        .mobile-hint {
          font-size: 0.8rem;
          color: #999;
          margin-top: 3px;
          font-style: italic;
          display: none;
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
        
        /* Mobile optimizations */
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
          
          .mobile-hint {
            display: block;
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
          
          /* Reduce animation complexity on mobile */
          .interesting-item {
            transition: background-color 0.2s ease, border-color 0.2s ease;
            will-change: auto;
          }
          
          /* Simplified hover effect for mobile */
          .item-hovered {
            box-shadow: none;
            transform: none;
          }
          
          /* Optimize touch feedback */
          .interesting-item:active {
            background-color: rgba(0, 0, 0, 0.03);
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