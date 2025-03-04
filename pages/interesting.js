import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getAllInterestingItems } from '../lib/interesting';
import { supabase } from '../lib/supabase';

export default function InterestingPage({ interestingItems }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [touchedItem, setTouchedItem] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const itemRefs = useRef({});
  
  // Detect touch devices on mount
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Set up intersection observer for mobile scroll-based highlighting
    if (typeof IntersectionObserver !== 'undefined') {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.7, // Item needs to be 70% visible to trigger
      };
      
      const observer = new IntersectionObserver((entries) => {
        // Only apply auto-highlight on touch devices
        if (!isTouch) return;
        
        // Remove this automatic selection on scroll
        // entries.forEach(entry => {
        //   const id = entry.target.dataset.id;
        //   if (entry.isIntersecting) {
        //     setTouchedItem(id);
        //   } else if (touchedItem === id) {
        //     setTouchedItem(null);
        //   }
        // });
      }, observerOptions);
      
      // Register all items for observation
      Object.values(itemRefs.current).forEach(ref => {
        if (ref) observer.observe(ref);
      });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isTouch, touchedItem, interestingItems]);

  const handleMouseEnter = (id) => {
    if (!isTouch) {
      setHoveredItem(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setHoveredItem(null);
    }
  };
  
  const handleTouch = (id) => {
    if (isTouch) {
      if (touchedItem === id) {
        // If already open, close it
        setTouchedItem(null);
      } else {
        // First tap, show the details
        // Make sure we clear any previously selected item
        setTouchedItem(null);
        // Use setTimeout to ensure UI updates properly before setting the new touched item
        setTimeout(() => {
          setTouchedItem(id);
        }, 10);
      }
    }
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
                ref={el => itemRefs.current[item.id] = el}
                data-id={item.id}
                className={`interesting-item ${
                  hoveredItem === item.id || touchedItem === item.id ? 'item-hovered' : ''
                } ${isTouch ? 'touch-device' : ''}`}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleTouch(item.id)}
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="item-link"
                  onClick={(e) => {
                    if (isTouch && touchedItem !== item.id) {
                      e.preventDefault(); // Prevent navigation on first touch
                    }
                  }}
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
                
                {(hoveredItem === item.id || touchedItem === item.id) && (
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
          transition: opacity 0.2s ease, max-height 0.3s ease;
        }
        
        /* Touch device specific styles */
        .touch-device {
          transition: background-color 0.3s ease;
        }
        
        .touch-device .item-row {
          position: relative;
        }
        
        .touch-device.item-hovered {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        /* Show "Why interesting" box when scrolled into view on mobile */
        .touch-device .item-why {
          margin-top: 0.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
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
          
          /* Mobile-specific touch indicators */
          .touch-device.item-hovered::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background: #0070f3;
            border-radius: 2px;
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