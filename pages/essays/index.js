import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getAllEssays } from '../../lib/markdown';

// Function to format date as "DD MMM YYYY"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

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
        
        // Remove this automatic selection on scroll
        // entries.forEach(entry => {
        //   const slug = entry.target.dataset.slug;
        //   if (entry.isIntersecting) {
        //     setTouchedEssay(slug);
        //   } else if (touchedEssay === slug) {
        //     setTouchedEssay(null);
        //   }
        // });
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
        // Make sure we clear any previously selected essay
        setTouchedEssay(null);
        // Use setTimeout to ensure UI updates properly before setting the new touched essay
        setTimeout(() => {
          setTouchedEssay(slug);
        }, 10);
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
                      <span className="title-text">{essay.title}</span>
                      {essay.type && <span className="type-tag">{essay.type}</span>}
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
          <p className="empty-message">No essays found.</p>
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
          color: var(--nav-text);
          font-size: 1rem;
          padding-left: 0.75rem;
        }

        .header-divider {
          height: 1px;
          background-color: var(--border-color);
          margin-bottom: 15px;
          width: 100%;
        }

        .header-date, .header-title {
          font-weight: 400;
        }

        .essays-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
        }

        .essay-container {
          margin-bottom: 0;
          border-radius: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .essay-hovered,
        .essay-container:hover {
          background-color: var(--card-bg);
        }

        .essay-container:hover .essay-title,
        .essay-hovered .essay-title {
          color: var(--accent-color);
        }

        .essay-container:hover .essay-date,
        .essay-hovered .essay-date {
          color: var(--text-color);
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
          padding: 8px 15px;
          align-items: center;
          min-height: 44px;
        }

        .essay-date {
          font-size: 0.85rem;
          color: var(--nav-text);
          display: flex;
          align-items: center;
          font-variant-numeric: tabular-nums;
        }

        .essay-title {
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          color: var(--text-color);
          gap: 0.5rem;
        }

        .title-text {
          position: relative;
          display: inline-block;
        }

        .title-text::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1.5px;
          background-color: var(--accent-color);
          transition: width 0.25s ease;
        }

        .essay-hovered .title-text::after,
        .essay-container:hover .title-text::after {
          width: 100%;
        }

        .type-tag {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--accent-color);
          background-color: var(--accent-bg);
          padding: 2px 8px;
          border-radius: 12px;
          white-space: nowrap;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        /* Essay summary displayed on hover/touch */
        .essay-summary {
          padding: 4px 15px 12px;
          margin-left: 150px;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--nav-text);
          font-style: italic;
          transition: opacity 0.15s ease, max-height 0.3s ease;
        }

        .empty-message {
          font-size: 0.9rem;
          color: var(--nav-text);
          font-style: italic;
        }

        /* Touch device specific styles */
        .touch-device {
          transition: background-color 0.15s ease;
        }

        .touch-device .essay-row {
          position: relative;
        }

        .touch-device.essay-hovered {
          background-color: var(--card-bg);
        }

        /* Show summary box when scrolled into view on mobile */
        .touch-device .essay-summary {
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 640px) {
          .essays-header, .essay-row {
            grid-template-columns: 100px 1fr;
          }

          .essay-date {
            font-size: 0.85rem;
          }

          .essay-summary {
            margin-left: 0;
            padding: 5px 15px 15px;
          }

          /* Tap again hint for mobile */
          .touch-device.essay-hovered .essay-summary::after {
            content: 'Tap again to read';
            display: block;
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: var(--link-color);
            text-align: right;
            font-style: italic;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const essays = await getAllEssays(['title', 'date', 'slug', 'summary', 'type']);
  
  return {
    props: {
      essays: essays || [], // Ensure we always return an array
    },
    revalidate: 60,
  };
} 