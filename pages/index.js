import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllEssays } from '../lib/markdown';
import { getAllInterestingItems } from '../lib/interesting';
import { getAboutContentFromNotion } from '../lib/notion';

export default function Home({ recentEssays, interestingItems, homeBio }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);

  useEffect(() => {
    // Reliable touch detection via hover media query
    const mq = window.matchMedia('(hover: none)');
    setIsTouch(mq.matches);
    const mqHandler = (e) => setIsTouch(e.matches);
    mq.addEventListener('change', mqHandler);

    const handleKeyDown = (e) => {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeyboardMode(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      mq.removeEventListener('change', mqHandler);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleMouseEnter = (id) => {
    if (!isTouch && !keyboardMode) {
      setHoveredItem(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouch && !keyboardMode) {
      setHoveredItem(null);
    }
  };
  
  // Handle keyboard focus
  const handleFocus = (id) => {
    if (keyboardMode) {
      setHoveredItem(id);
    }
  };
  
  const handleBlur = (e) => {
    if (keyboardMode) {
      const next = e.relatedTarget;
      if (!next || !(next.closest('.interesting-item') || next.closest('.essay-item'))) {
        setHoveredItem(null);
      }
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
                  onMouseEnter={() => !isTouch && setHoveredItem(essay.slug)}
                  onMouseLeave={() => !isTouch && setHoveredItem(null)}
                >
                  <Link href={`/essays/${essay.slug}`} className="item-link">
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
                  data-id={item.id}
                  onClick={() => {
                    if (isTouch && hoveredItem !== item.id) {
                      setHoveredItem(item.id);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, item.id, item.url)}
                  role="button"
                  aria-expanded={hoveredItem === item.id}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="item-link"
                    onClick={(e) => {
                      if (isTouch && hoveredItem !== item.id) {
                        e.preventDefault();
                      }
                      if (isTouch && hoveredItem === item.id) {
                        e.stopPropagation();
                      }
                    }}
                    tabIndex={-1}
                  >
                    <div className="item-row">
                      <div className="item-date">
                        {formatDate(item.date)}
                      </div>
                      <div className="item-title">
                        <span className="title-text">{item.title}</span>
                        {item.type && <span className="type-tag">{item.type}</span>}
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

        .section-header :global(.section-link:active) {
          background-color: var(--card-hover-bg);
          color: var(--accent-color);
        }

        @media (hover: hover) {
          .section-header :global(.section-link:hover) {
            background-color: var(--card-hover-bg);
            color: var(--accent-color);
          }
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

        .item-hovered {
          background-color: var(--card-bg);
        }

        .essay-item:active, .interesting-item:active {
          background-color: var(--card-bg);
        }

        @media (hover: hover) {
          .essay-item:hover, .interesting-item:hover {
            background-color: var(--card-bg);
          }
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

        .item-hovered .title-text::after {
          width: 100%;
        }

        .essay-item:active .title-text::after,
        .interesting-item:active .title-text::after {
          width: 100%;
        }

        @media (hover: hover) {
          .essay-item:hover .title-text::after,
          .interesting-item:hover .title-text::after {
            width: 100%;
          }
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

        .item-hovered .item-title {
          color: var(--accent-color);
        }

        .item-hovered .item-date {
          color: var(--text-color);
        }

        .essay-item:active .item-title,
        .interesting-item:active .item-title {
          color: var(--accent-color);
        }

        .essay-item:active .item-date,
        .interesting-item:active .item-date {
          color: var(--text-color);
        }

        @media (hover: hover) {
          .essay-item:hover .item-title,
          .interesting-item:hover .item-title {
            color: var(--accent-color);
          }

          .essay-item:hover .item-date,
          .interesting-item:hover .item-date {
            color: var(--text-color);
          }
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