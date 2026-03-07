import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllEssays } from '../lib/markdown';
import { getAllInterestingItems } from '../lib/interesting';
import { getAboutContentFromNotion } from '../lib/notion';

export default function Home({ recentEssays, interestingItems, homeBio }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const itemRefs = useRef({});
  const essayRefs = useRef({});

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Detect keyboard navigation
    const handleKeyDown = (e) => {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeyboardMode(true);
      }
    };
    
    const handleMouseDown = () => {
      setKeyboardMode(false);
    };
    
    // Add listeners for custom keyboard focus events from Layout component
    const handleKeyboardFocus = (e) => {
      const { itemId } = e.detail;
      if (itemId) {
        setHoveredItem(itemId);
      }
    };
    
    // Set up event listeners for all interesting items
    Object.entries(itemRefs.current).forEach(([id, ref]) => {
      if (ref) {
        ref.addEventListener('keyboardFocus', handleKeyboardFocus);
      }
    });
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      
      Object.entries(itemRefs.current).forEach(([id, ref]) => {
        if (ref) {
          ref.removeEventListener('keyboardFocus', handleKeyboardFocus);
        }
      });
    };
  }, []);

  const handleMouseEnter = (id) => {
    if (!isMobile && !keyboardMode) {
      setHoveredItem(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !keyboardMode) {
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
  
  // Handle keyboard focus
  const handleFocus = (id) => {
    if (keyboardMode) {
      setHoveredItem(id);
    }
  };
  
  const handleBlur = () => {
    if (keyboardMode) {
      // Use a small delay to allow new focus to be set before removing hover
      setTimeout(() => {
        if (!document.activeElement || 
            !(document.activeElement.closest('.interesting-item') || 
              document.activeElement.closest('.essay-item'))) {
          setHoveredItem(null);
        }
      }, 50);
    }
  };
  
  // Handle keyboard Enter/Space keys
  const handleKeyDown = (e, id, url) => {
    if (e.key === 'Enter') {
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else if (e.key === ' ') { // Space key
      e.preventDefault(); // Prevent page scroll
      setHoveredItem(id === hoveredItem ? null : id);
    }
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
        <p className="intro-line">Part investment brain, part tinkerer. Here's what I've been chewing on.</p>

        <section className="content-section">
          <div className="section-header">
            <h2>Essays</h2>
            <Link href="/essays" className="section-link">
              all essays →
            </Link>
          </div>
          
          {recentEssays && recentEssays.length > 0 ? (
            <div className="content-list">
              {recentEssays.map((essay) => (
                <div 
                  key={essay.slug} 
                  className={`essay-item ${hoveredItem === essay.slug ? 'item-hovered' : ''}`}
                  onMouseEnter={() => handleMouseEnter(essay.slug)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleFocus(essay.slug)}
                  onBlur={handleBlur}
                  tabIndex={0}
                  ref={el => essayRefs.current[essay.slug] = el}
                  data-id={essay.slug}
                  onKeyDown={(e) => handleKeyDown(e, essay.slug)}
                  role="button"
                >
                  <Link href={`/essays/${essay.slug}`} className="item-link" tabIndex={-1}>
                    <div className="item-row">
                      <div className="item-date">
                        {formatDate(essay.date)}
                      </div>
                      <div className="item-title">
                        <span className="title-text">{essay.title}</span>
                        {essay.type && <span className="type-tag">{essay.type}</span>}
                      </div>
                    </div>
                  </Link>
                  {essay.summary && hoveredItem === essay.slug && (
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
                  onFocus={() => handleFocus(item.id)}
                  onBlur={handleBlur}
                  tabIndex={0}
                  ref={el => itemRefs.current[item.id] = el}
                  data-id={item.id}
                  onKeyDown={(e) => handleKeyDown(e, item.id, item.url)}
                  role="button"
                  aria-pressed={hoveredItem === item.id}
                >
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="item-link"
                    onClick={(e) => hoveredItem === item.id || !isMobile ? true : handleItemClick(e, item.id)}
                    tabIndex={-1}
                  >
                    <div className="item-row">
                      <div className="item-date">
                        {formatDate(item.date)}
                      </div>
                      <div className="item-title">
                        <span className="title-text">{item.title}</span>
                        {item.type && <span className="type-tag">{item.type}</span>}
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
          max-width: 960px;
          margin: 0 auto;
        }



        .content-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 1.25rem 0;
          width: 100%;
        }

        .content-section {
          margin-bottom: 0.25rem;
          padding: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.5rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid var(--border-color);
        }

        .section-header h2 {
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0;
          color: var(--nav-text);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .section-header :global(.section-link) {
          font-size: 0.8rem;
          color: var(--text-color);
          text-decoration: none;
          font-weight: 500;
          background-color: var(--card-bg);
          padding: 5px 14px;
          border-radius: 20px;
          transition: all 0.15s ease;
        }

        .section-header :global(.section-link:hover) {
          background-color: var(--card-hover-bg);
          color: var(--accent-color);
        }
        
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Common styles for both essay and interesting items */
        .essay-item, .interesting-item {
          border-radius: 8px;
          transition: all 0.15s ease;
          margin-bottom: 0;
          cursor: pointer;
        }

        .essay-item:focus, .interesting-item:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: 2px;
          position: relative;
        }

        /* Ensure hover state shows correctly for keyboard navigation */
        .keyboard-mode .essay-item:focus, .keyboard-mode .interesting-item:focus {
          background-color: var(--hover-bg);
        }

        /* Make sure keyboard focused items show expanded content */
        .keyboard-mode .essay-item:focus .item-summary,
        .keyboard-mode .interesting-item:focus .item-why {
          display: block;
        }

        .essay-item:hover, .item-hovered {
          background-color: var(--card-bg);
        }
        
        .essay-item :global(.item-link),
        .interesting-item :global(.item-link),
        .item-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .item-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding: 8px 15px;
          align-items: center;
          height: 100%;
        }
        
        .item-date {
          font-size: 0.85rem;
          color: var(--nav-text);
          font-variant-numeric: tabular-nums;
        }
        
        .item-title {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-color);
          display: flex;
          align-items: center;
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

        .essay-item:hover .title-text::after,
        .interesting-item:hover .title-text::after,
        .item-hovered .title-text::after {
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

        .essay-item:hover .item-title,
        .interesting-item:hover .item-title,
        .item-hovered .item-title {
          color: var(--accent-color);
        }

        .essay-item:hover .item-date,
        .interesting-item:hover .item-date,
        .item-hovered .item-date {
          color: var(--text-color);
        }

        .item-summary {
          padding: 4px 15px 12px;
          margin-left: 150px;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--nav-text);
          font-style: italic;
        }
        
        .item-why {
          padding: 10px 15px 15px;
          margin-left: 150px;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-color);
          background-color: var(--hover-bg);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          transition: opacity 0.2s ease, max-height 0.3s ease;
        }
        
        .mobile-hint {
          font-size: 0.8rem;
          color: var(--link-color);
          margin-left: 8px;
        }
        
        .empty-message {
          font-size: 0.9rem;
          color: var(--nav-text);
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 100px 1fr;
          }

          .item-date {
            font-size: 0.8rem;
          }

          .item-title {
            font-size: 0.9rem;
          }

          .item-summary {
            margin-left: 0;
            padding: 5px 15px 15px;
          }

          .item-why {
            margin-left: 0;
            padding: 10px 15px 15px;
            border-top: 1px solid var(--border-color);
          }

          .type-tag {
            font-size: 0.65rem;
            padding: 1px 6px;
          }

          .section-header h2 {
            font-size: 0.75rem;
          }

          .section-header :global(.section-link) {
            font-size: 0.75rem;
            padding: 4px 10px;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const allEssays = await getAllEssays(['title', 'date', 'slug', 'summary', 'type']);
  const recentEssays = allEssays.slice(0, 3);
  const interestingItems = await getAllInterestingItems(3);

  let homeBio = [];
  try {
    const about = await getAboutContentFromNotion();
    if (about && about.homeBio && about.homeBio.length > 0) {
      homeBio = about.homeBio;
    }
  } catch (error) {
    console.error('Error fetching home bio from Notion:', error);
  }

  return {
    props: {
      recentEssays: recentEssays.slice(0, 3),
      interestingItems,
      homeBio,
    },
    revalidate: 60,
  };
} 