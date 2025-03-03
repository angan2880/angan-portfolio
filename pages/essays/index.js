import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getAllEssays } from '../../lib/markdown';

export default function Essays({ essays }) {
  const [hoveredEssay, setHoveredEssay] = useState(null);
  const [touchedEssay, setTouchedEssay] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const essayRefs = useRef({});

  // Detect touch devices on mount and set up observers for scroll-based highlighting
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
        
        entries.forEach(entry => {
          const slug = entry.target.dataset.slug;
          if (entry.isIntersecting) {
            setTouchedEssay(slug);
          } else if (touchedEssay === slug) {
            setTouchedEssay(null);
          }
        });
      }, observerOptions);
      
      // Register all items for observation
      Object.values(essayRefs.current).forEach(ref => {
        if (ref) observer.observe(ref);
      });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [isTouch, touchedEssay, essays]);

  const handleMouseEnter = (slug) => {
    if (!isTouch) {
      setHoveredEssay(slug);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch) {
      setHoveredEssay(null);
    }
  };
  
  const handleTouch = (slug, url) => {
    if (isTouch) {
      if (touchedEssay === slug) {
        // Second tap, navigate to the essay
        window.location.href = url;
      } else {
        // First tap, show the summary
        setTouchedEssay(slug);
      }
    }
  };

  return (
    <Layout title="Essays" description="Essays by Angan Sarker">
      <div className="essays-container">
        <div className="essays-header">
          <div className="header-date">Date</div>
          <div className="header-title">Title</div>
        </div>
        
        <div className="header-divider"></div>
        
        {essays.length > 0 ? (
          <div className="essays-list">
            {essays.map((essay) => (
              <div 
                key={essay.slug}
                ref={el => essayRefs.current[essay.slug] = el}
                data-slug={essay.slug}
                className={`essay-container ${
                  hoveredEssay === essay.slug || touchedEssay === essay.slug ? 'essay-hovered' : ''
                } ${isTouch ? 'touch-device' : ''}`}
                onMouseEnter={() => handleMouseEnter(essay.slug)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleTouch(essay.slug, `/essays/${essay.slug}`)}
              >
                <Link 
                  href={`/essays/${essay.slug}`} 
                  className="essay-link"
                  onClick={(e) => {
                    if (isTouch) {
                      // Prevent default navigation on any tap inside the item
                      e.preventDefault();
                    }
                  }}
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
                
                {/* Show summary when hovered/touched */}
                {(hoveredEssay === essay.slug || touchedEssay === essay.slug) && essay.summary && (
                  <div 
                    className="essay-summary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTouch) {
                        handleTouch(essay.slug, `/essays/${essay.slug}`);
                      }
                    }}
                  >
                    {essay.summary}
                  </div>
                )}
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
        
        /* Essay summary displayed on hover/touch */
        .essay-summary {
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
        
        .touch-device .essay-row {
          position: relative;
        }
        
        .touch-device.essay-hovered {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        /* Show summary box when scrolled into view on mobile */
        .touch-device .essay-summary {
          margin-top: 0.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        @media (max-width: 640px) {
          .essays-header, .essay-row {
            grid-template-columns: 100px 1fr;
          }
          
          .essay-date {
            font-size: 0.8rem;
          }
          
          .essay-summary {
            margin-left: 0;
          }
          
          /* Mobile-specific touch indicators */
          .touch-device.essay-hovered::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background: #0070f3;
            border-radius: 2px;
          }
          
          /* Tap again hint for mobile */
          .touch-device.essay-hovered .essay-summary::after {
            content: 'Tap again to read';
            display: block;
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: #0070f3;
            text-align: right;
            font-style: italic;
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
  const essays = await getAllEssays();

  return {
    props: {
      essays,
    },
  };
} 