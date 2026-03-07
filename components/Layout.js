import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

export default function Layout({ children, title = "Angan Sarker", description = "Investment Analyst at John Hancock Investment Management" }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusedNavIndex, setFocusedNavIndex] = useState(-1);
  const navRefs = useRef([]);
  const [focusableElements, setFocusableElements] = useState([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  
  // Navigation items config
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Essays', path: '/essays' },
    { label: 'Interesting', path: '/interesting' },
    { label: 'About', path: '/about' }
  ];
  
  // After mounting, we can show the theme toggle since we know what theme is active
  useEffect(() => {
    setMounted(true);
    navRefs.current = navRefs.current.slice(0, navItems.length);
    
    // Find all focusable elements in the document after mounting
    if (typeof document !== 'undefined') {
      const getFocusableElements = () => {
        const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const elements = Array.from(document.querySelectorAll(selector))
          .filter(el => {
            // Filter out hidden elements
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('disabled');
          });
        return elements;
      };
      
      setFocusableElements(getFocusableElements());
      
      // Update focusable elements when DOM changes
      const observer = new MutationObserver(() => {
        setFocusableElements(getFocusableElements());
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    }
  }, []);
  
  const isActive = (path) => {
    return router.pathname === path;
  };

  // Get elements in same row (horizontally aligned)
  const getElementsInSameRow = (element) => {
    if (!element) return [];
    
    const rect = element.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const tolerance = rect.height / 2;
    
    return focusableElements.filter(el => {
      if (el === element) return false;
      const elRect = el.getBoundingClientRect();
      const elCenterY = elRect.top + elRect.height / 2;
      return Math.abs(elCenterY - centerY) <= tolerance;
    });
  };
  
  // Get elements in same column (vertically aligned)
  const getElementsInSameColumn = (element) => {
    if (!element) return [];
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const tolerance = rect.width / 2;
    
    return focusableElements.filter(el => {
      if (el === element) return false;
      const elRect = el.getBoundingClientRect();
      const elCenterX = elRect.left + elRect.width / 2;
      return Math.abs(elCenterX - centerX) <= tolerance;
    });
  };
  
  // Find nearest element in a given direction
  const findNearestElement = (element, direction) => {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    let bestElement = null;
    let bestDistance = Infinity;
    
    focusableElements.forEach(el => {
      if (el === element) return;
      
      const elRect = el.getBoundingClientRect();
      let valid = false;
      let distance = 0;
      
      switch (direction) {
        case 'left':
          valid = elRect.right < rect.left && 
                  elRect.bottom > rect.top && 
                  elRect.top < rect.bottom;
          if (valid) distance = rect.left - elRect.right;
          break;
        case 'right':
          valid = elRect.left > rect.right && 
                  elRect.bottom > rect.top && 
                  elRect.top < rect.bottom;
          if (valid) distance = elRect.left - rect.right;
          break;
        case 'up':
          valid = elRect.bottom < rect.top && 
                  elRect.right > rect.left && 
                  elRect.left < rect.right;
          if (valid) distance = rect.top - elRect.bottom;
          break;
        case 'down':
          valid = elRect.top > rect.bottom && 
                  elRect.right > rect.left && 
                  elRect.left < rect.right;
          if (valid) distance = elRect.top - rect.bottom;
          break;
      }
      
      if (valid && distance < bestDistance) {
        bestDistance = distance;
        bestElement = el;
      }
    });
    
    return bestElement;
  };

  // Simulate hover effect for keyboard focus
  const simulateHoverEffect = (element) => {
    if (!element) return;
    
    // For interesting items
    if (element.classList.contains('interesting-item')) {
      // Find the item ID from data attribute
      const itemId = element.dataset.id;
      if (itemId) {
        // Dispatch a custom event that interesting.js can listen for
        const event = new CustomEvent('keyboardFocus', { detail: { itemId } });
        element.dispatchEvent(event);
      }
    }
    
    // For essay items
    if (element.classList.contains('essay-item')) {
      element.classList.add('keyboard-hovered');
    }
    
    // Add any specific hover simulation logic here for other element types
  };

  // Handle keyboard navigation with arrow keys
  const handleKeyDown = useCallback((e) => {
    // Only trigger shortcuts when not in an input, textarea, etc.
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Enter keyboard mode with any arrow key press
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      if (!keyboardMode) {
        setKeyboardMode(true);
        setCurrentFocusIndex(0);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
          simulateHoverEffect(focusableElements[0]);
        }
        e.preventDefault();
        return;
      }
      
      // If in the nav area, handle navigation there
      if (focusedNavIndex !== -1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedNavIndex(prev => (prev + 1) % navItems.length);
          return;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedNavIndex(prev => (prev - 1 + navItems.length) % navItems.length);
          return;
        } else if (e.key === 'ArrowDown') {
          // Move from nav to content area
          e.preventDefault();
          setFocusedNavIndex(-1);
          
          // Find the first focusable element in the main content area
          const mainContentElements = focusableElements.filter(el => {
            const mainContent = document.getElementById('main-content');
            return mainContent && mainContent.contains(el);
          });
          
          if (mainContentElements.length > 0) {
            const nextIndex = focusableElements.indexOf(mainContentElements[0]);
            setCurrentFocusIndex(nextIndex);
            mainContentElements[0].focus();
            simulateHoverEffect(mainContentElements[0]);
          }
          return;
        }
        // For ArrowUp in nav, we don't prevent default scrolling
        return;
      }
      
      // General keyboard navigation throughout the page
      const currentElement = focusableElements[currentFocusIndex];
      let nextElement = null;
      
      if (e.key === 'ArrowRight') {
        // Only navigate horizontally with left/right keys
        const sameRowElements = getElementsInSameRow(currentElement);
        const rightElements = sameRowElements.filter(el => {
          return el.getBoundingClientRect().left > currentElement.getBoundingClientRect().left;
        });
        
        if (rightElements.length > 0) {
          // Find the closest element to the right
          nextElement = rightElements.reduce((closest, current) => {
            const closestDist = closest.getBoundingClientRect().left - currentElement.getBoundingClientRect().right;
            const currentDist = current.getBoundingClientRect().left - currentElement.getBoundingClientRect().right;
            return currentDist < closestDist ? current : closest;
          });
          e.preventDefault();
        } else {
          // If nothing found in the same row, try to find anything to the right
          nextElement = findNearestElement(currentElement, 'right');
          if (nextElement) e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft') {
        // Only navigate horizontally with left/right keys
        const sameRowElements = getElementsInSameRow(currentElement);
        const leftElements = sameRowElements.filter(el => {
          return el.getBoundingClientRect().right < currentElement.getBoundingClientRect().left;
        });
        
        if (leftElements.length > 0) {
          // Find the closest element to the left
          nextElement = leftElements.reduce((closest, current) => {
            const closestDist = currentElement.getBoundingClientRect().left - closest.getBoundingClientRect().right;
            const currentDist = currentElement.getBoundingClientRect().left - current.getBoundingClientRect().right;
            return currentDist < closestDist ? current : closest;
          });
          e.preventDefault();
        } else {
          // If nothing found in the same row, try to find anything to the left
          nextElement = findNearestElement(currentElement, 'left');
          if (nextElement) e.preventDefault();
        }
      } else if (e.key === 'ArrowDown') {
        // Only navigate vertically with up/down keys
        const sameColumnElements = getElementsInSameColumn(currentElement);
        const belowElements = sameColumnElements.filter(el => {
          return el.getBoundingClientRect().top > currentElement.getBoundingClientRect().bottom;
        });
        
        if (belowElements.length > 0) {
          // Find the closest element below
          nextElement = belowElements.reduce((closest, current) => {
            const closestDist = closest.getBoundingClientRect().top - currentElement.getBoundingClientRect().bottom;
            const currentDist = current.getBoundingClientRect().top - currentElement.getBoundingClientRect().bottom;
            return currentDist < closestDist ? current : closest;
          });
          e.preventDefault();
        } else {
          // If nothing found in the same column, try to find anything below
          nextElement = findNearestElement(currentElement, 'down');
          if (nextElement) e.preventDefault();
        }
      } else if (e.key === 'ArrowUp') {
        // Only navigate vertically with up/down keys
        const sameColumnElements = getElementsInSameColumn(currentElement);
        const aboveElements = sameColumnElements.filter(el => {
          return el.getBoundingClientRect().bottom < currentElement.getBoundingClientRect().top;
        });
        
        if (aboveElements.length > 0) {
          // Find the closest element above
          nextElement = aboveElements.reduce((closest, current) => {
            const closestDist = currentElement.getBoundingClientRect().top - closest.getBoundingClientRect().bottom;
            const currentDist = currentElement.getBoundingClientRect().top - current.getBoundingClientRect().bottom;
            return currentDist < closestDist ? current : closest;
          });
          e.preventDefault();
        } else {
          // If nothing found in the same column, try to find anything above
          nextElement = findNearestElement(currentElement, 'up');
          
          // Special case: if we're at the top of the content and press up,
          // check if we should move to the nav
          if (!nextElement) {
            const navElement = document.querySelector('.nav');
            if (navElement && navElement.getBoundingClientRect().bottom < currentElement.getBoundingClientRect().top) {
              setFocusedNavIndex(0);
              setCurrentFocusIndex(-1);
              e.preventDefault();
              return;
            }
          } else {
            e.preventDefault();
          }
        }
      }
      
      if (nextElement) {
        // Remove any previous hover effects
        if (currentElement) {
          currentElement.classList.remove('keyboard-hovered');
        }
        
        const nextIndex = focusableElements.indexOf(nextElement);
        if (nextIndex !== -1) {
          setCurrentFocusIndex(nextIndex);
          nextElement.focus();
          simulateHoverEffect(nextElement);
        }
      }
      // If no next element found, let the browser handle the arrow key (scroll)
    }
    
    // Toggle theme with 'D' key
    if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
    
    // Navigate to the focused item with Enter key
    if (e.key === 'Enter') {
      if (focusedNavIndex >= 0 && focusedNavIndex < navItems.length) {
        e.preventDefault();
        router.push(navItems[focusedNavIndex].path);
      }
    }
    
    // Space key to toggle expansion or activate elements
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (e.target.classList.contains('interesting-item') ||
          e.target.classList.contains('essay-item') ||
          e.target.tagName === 'BUTTON') {
        e.preventDefault();
      } else if (e.target.tagName === 'A') {
        e.preventDefault();
        e.target.click();
      }
    }
    
    // Exit keyboard mode with Escape
    if (e.key === 'Escape') {
      setKeyboardMode(false);
      setFocusedNavIndex(-1);
      setCurrentFocusIndex(-1);
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      // Remove any keyboard hover effects
      document.querySelectorAll('.keyboard-hovered').forEach(el => {
        el.classList.remove('keyboard-hovered');
      });
    }
  }, [focusedNavIndex, navItems.length, router, resolvedTheme, setTheme, keyboardMode, focusableElements, currentFocusIndex]);

  // Add event listeners
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const handleKeyDownEvent = (e) => handleKeyDown(e);
      const handleMouseDownEvent = () => {
        setKeyboardMode(false);
        setFocusedNavIndex(-1);
        setCurrentFocusIndex(-1);
        
        // Remove any keyboard hover effects
        document.querySelectorAll('.keyboard-hovered').forEach(el => {
          el.classList.remove('keyboard-hovered');
        });
      };
      
      window.addEventListener('keydown', handleKeyDownEvent);
      window.addEventListener('mousedown', handleMouseDownEvent);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDownEvent);
        window.removeEventListener('mousedown', handleMouseDownEvent);
      };
    }
  }, [handleKeyDown]);

  // Focus the navigationally focused element when it changes
  useEffect(() => {
    if (focusedNavIndex >= 0 && navRefs.current[focusedNavIndex]) {
      navRefs.current[focusedNavIndex].focus();
    }
  }, [focusedNavIndex]);

  return (
    <div className={keyboardMode ? 'keyboard-mode' : ''}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Link href="/" aria-label="Home">
              <svg className="logo-mark" width="44" height="36" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="28" fontFamily="'Inter', sans-serif" fontSize="28" fontWeight="800" fill="var(--text-color)">A</text>
                <text x="20" y="28" fontFamily="'Inter', sans-serif" fontSize="28" fontWeight="800" fill="var(--text-color)" opacity="0.45">S</text>
                <line x1="1" y1="33" x2="19" y2="33" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
          
          <nav className="nav">
            {navItems.map((item, index) => (
              <Link 
                key={item.path}
                href={item.path} 
                className={`${isActive(item.path) ? 'active' : ''} ${focusedNavIndex === index ? 'keyboard-focused' : ''}`}
                ref={el => (navRefs.current[index] = el)}
                tabIndex={0}
              >
                {item.label}
              </Link>
            ))}
            
            <button 
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              className="theme-toggle" 
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && resolvedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div>© {new Date().getFullYear()} Angan Sarker</div>
        </div>
      </footer>

      <style jsx>{`
        .header {
          border-bottom: none;
          padding: 1.5rem 0;
          width: 100%;
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-color), var(--accent-light), transparent);
        }
        
        .header-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .logo {
          flex: 0 0 auto;
          position: relative;
        }

        .logo-mark {
          display: block;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        @media (hover: hover) {
          .logo-mark:hover {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }

        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-color);
          margin-left: 0.5rem;
          padding: 0.75rem;
          border-radius: 50%;
          min-width: 44px;
          min-height: 44px;
          transition: background-color 0.2s ease;
        }
        
        @media (hover: hover) {
          .theme-toggle:hover {
            background-color: var(--hover-bg);
          }
        }
        
        
        
        .nav {
          display: flex;
          gap: 1.5rem;
          margin-left: auto;
          align-items: center;
        }
        
        .nav a {
          font-size: 0.9rem;
          font-weight: 450;
          color: var(--nav-text);
          transition: all 0.15s ease;
          padding: 6px 12px;
          border-radius: 6px;
          position: relative;
        }

        @media (hover: hover) {
          .nav a:hover {
            color: var(--nav-text-hover);
            background-color: var(--nav-hover-bg);
          }
        }

        .nav a.active {
          color: var(--text-color);
          font-weight: 500;
        }

        .nav a.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 12px;
          right: 12px;
          height: 2px;
          background-color: var(--accent-color);
          border-radius: 1px;
        }
        
        main {
          max-width: 960px;
          width: 100%;
          margin: 0 auto;
          padding: 1.25rem 2rem 2rem;
        }
        
        .footer {
          border-top: 2px solid var(--accent-color);
          padding: 2rem 0;
          color: var(--footer-text);
          margin-top: 1rem;
        }

        .footer-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 2rem;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            padding: 0 1rem;
          }

          .nav {
            margin-top: 0.75rem;
            margin-left: 0;
            gap: 0.25rem;
            flex-wrap: wrap;
          }

          .nav a {
            font-size: 0.85rem;
            padding: 10px 12px;
          }

          main {
            padding: 1.25rem 1rem 2rem;
          }

          .footer-content {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
} 