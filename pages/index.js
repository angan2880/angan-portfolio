import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllEssays } from '../lib/markdown';
import { getAllInterestingItems } from '../lib/interesting';

export default function Home({ recentEssays, interestingItems }) {
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
          color: var(--text-color);
          margin-bottom: 1rem;
        }
        
        .bio-text:last-child {
          margin-bottom: 0;
        }
        
        .content-divider {
          height: 1px;
          background-color: var(--border-color);
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
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        
        .section-header h2 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-color);
        }
        
        .section-link {
          font-size: 0.9rem;
          color: var(--nav-text);
          text-decoration: none;
        }
        
        .section-link:hover {
          text-decoration: underline;
          color: var(--nav-text-hover);
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
          margin-bottom: 0.5rem;
          cursor: pointer;
        }
        
        .essay-item:focus, .interesting-item:focus {
          outline: 2px solid var(--link-color);
          outline-offset: 2px;
          position: relative;
        }
        
        /* Ensure hover state shows correctly for keyboard navigation */
        .keyboard-mode .essay-item:focus, .keyboard-mode .interesting-item:focus {
          background-color: var(--hover-bg);
          border-left: 4px solid var(--link-color);
          box-shadow: 0 1px 3px var(--card-shadow);
          transform: translateY(-2px);
        }
        
        /* Make sure keyboard focused items show expanded content */
        .keyboard-mode .essay-item:focus .item-summary,
        .keyboard-mode .interesting-item:focus .item-why {
          display: block;
        }
        
        .essay-item:hover, .item-hovered {
          background-color: var(--hover-bg);
          border-left: 4px solid var(--link-color);
          box-shadow: 0 1px 3px var(--card-shadow);
          transform: translateY(-2px);
        }
        
        .item-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .item-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding: 10px 15px;
          align-items: center;
          height: 100%;
        }
        
        .item-date {
          font-size: 0.9rem;
          color: var(--nav-text);
        }
        
        .item-title {
          font-size: 1rem;
          font-weight: 400;
          color: var(--text-color);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .item-summary, .item-why {
          padding: 5px 15px 15px;
          margin-left: 150px;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-color);
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
            font-size: 0.85rem;
          }
          
          .item-summary, .item-why {
            margin-left: 0;
            padding: 5px 15px 15px;
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