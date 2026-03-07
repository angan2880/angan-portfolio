import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAllInterestingItems } from '../lib/interesting';

export default function InterestingPage({ interestingItems }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [touchedItem, setTouchedItem] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);

  // Detect touch devices reliably using hover media query
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    setIsTouch(mq.matches);
    const handler = (e) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);

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
      mq.removeEventListener('change', handler);
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

  const handleTouch = (id) => {
    if (isTouch) {
      if (touchedItem !== id) {
        // First tap on a new item — show the details
        setTouchedItem(id);
      }
      // If touchedItem === id (second tap), do nothing here;
      // the <a> onClick will handle navigation since it won't preventDefault
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
      if (!next || !next.closest('.interesting-item')) {
        setHoveredItem(null);
      }
    }
  };

  // Handle keyboard Enter key
  const handleKeyDown = (e, id, url) => {
    if (e.key === 'Enter') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (e.key === ' ') { // Space key
      e.preventDefault(); // Prevent page scroll
      setHoveredItem(id === hoveredItem ? null : id);
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
        <p className="intro-line">A curated collection of articles, tools, and resources that caught my attention.</p>

        <div className="interesting-header">
          <div className="header-date">Date</div>
          <div className="header-title">Title</div>
        </div>

        {interestingItems.length > 0 ? (
          <div className="content-list">
            {interestingItems.map((item) => (
              <div
                key={item.id}
                data-id={item.id}
                className={`interesting-item ${
                  hoveredItem === item.id || touchedItem === item.id ? 'item-hovered' : ''
                } ${isTouch ? 'touch-device' : ''}`}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleTouch(item.id)}
                onFocus={() => handleFocus(item.id)}
                onBlur={handleBlur}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, item.id, item.url)}
                role="button"
                aria-expanded={hoveredItem === item.id || touchedItem === item.id}
                aria-label={`${item.title} - ${item.type}`}
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
                    if (isTouch && touchedItem === item.id) {
                      e.stopPropagation(); // Prevent outer div from toggling on second tap
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

                {(hoveredItem === item.id || touchedItem === item.id) && (
                  <div className="item-why">
                    {item.why}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No interesting items found.</p>
        )}
      </div>

      <style jsx>{`
        .interesting-container {
          max-width: 960px;
          margin: 0 auto;
          padding-top: 0;
        }

        .interesting-header {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding: 0 0.75rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.75rem;
          color: var(--nav-text);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .header-date, .header-title {
          font-weight: 600;
        }

        .content-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .interesting-item {
          border-radius: 8px;
          transition: all 0.15s ease;
          margin-bottom: 0;
          cursor: pointer;
        }

        /* Add focus styles for keyboard navigation */
        .interesting-item:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: 2px;
          position: relative;
        }

        .item-hovered {
          background-color: var(--card-bg);
        }

        .item-hovered .item-title {
          color: var(--accent-color);
        }

        .item-hovered .item-date {
          color: var(--text-color);
        }

        .interesting-item:active {
          background-color: var(--card-bg);
        }

        .interesting-item:active .item-title {
          color: var(--accent-color);
        }

        .interesting-item:active .item-date {
          color: var(--text-color);
        }

        @media (hover: hover) {
          .interesting-item:hover {
            background-color: var(--card-bg);
          }

          .interesting-item:hover .item-title {
            color: var(--accent-color);
          }

          .interesting-item:hover .item-date {
            color: var(--text-color);
          }
        }

        .item-link {
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
        }

        .item-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          padding: 8px 15px;
          align-items: center;
          min-height: 44px;
        }

        .item-date {
          font-size: 0.85rem;
          color: var(--nav-text);
          display: flex;
          align-items: center;
          font-variant-numeric: tabular-nums;
        }

        .item-title {
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);
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

        .interesting-item:active .title-text::after {
          width: 100%;
        }

        @media (hover: hover) {
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

        .item-why {
          padding: 10px 15px 15px;
          margin-left: 150px;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-color);
          background-color: var(--hover-bg);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          transition: opacity 0.15s ease, max-height 0.3s ease;
        }

        /* Make sure keyboard focused items show expanded content */
        .keyboard-mode .interesting-item:focus .item-why {
          display: block;
        }

        /* Touch device specific styles */
        .touch-device {
          transition: background-color 0.15s ease;
        }

        .touch-device .item-row {
          position: relative;
        }

        .touch-device.item-hovered {
          background-color: var(--card-bg);
        }

        /* Show "Why interesting" box when scrolled into view on mobile */
        .touch-device .item-why {
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .empty-message {
          font-size: 0.9rem;
          color: var(--nav-text);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .interesting-header, .item-row {
            grid-template-columns: 100px 1fr;
          }

          .item-date {
            font-size: 0.8rem;
          }

          .item-title {
            font-size: 0.9rem;
          }

          .item-why {
            margin-left: 0;
          }

          .type-tag {
            font-size: 0.65rem;
            padding: 1px 6px;
          }
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const interestingItems = await getAllInterestingItems();

  return {
    props: { interestingItems },
    revalidate: 60,
  };
}