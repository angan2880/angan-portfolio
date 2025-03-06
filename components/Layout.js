import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

export default function Layout({ children, title = "Angan Sarker", description = "Investment Analyst at John Hancock Investment Management" }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [focusedNavIndex, setFocusedNavIndex] = useState(-1);
  const navRefs = useRef([]);
  const [focusableElements, setFocusableElements] = useState([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  
  // Navigation items config
  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'ESSAYS', path: '/essays' },
    { label: 'INTERESTING', path: '/interesting' },
    { label: 'ABOUT', path: '/about' }
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
      setTheme(theme === 'dark' ? 'light' : 'dark');
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
      // Only prevent default for elements that would benefit from space activation
      if (e.target.classList.contains('interesting-item') || 
          e.target.classList.contains('essay-item') ||
          e.target.tagName === 'BUTTON' ||
          e.target.tagName === 'A') {
        e.preventDefault();
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
  }, [focusedNavIndex, navItems.length, router, theme, setTheme, keyboardMode, focusableElements, currentFocusIndex]);

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
            <Link href="/">
              <h1 className="name-header">
                <span className="first-name">Angan</span>{' '}
                <span className="last-name">Sarker</span>
              </h1>
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
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="theme-toggle" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
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
        <div className="container">
          <div>© {new Date().getFullYear()} Angan Sarker</div>
        </div>
      </footer>

      <style jsx>{`
        .header {
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem 0;
          width: 100%;
          /* Define custom properties for animation state at the top level */
          --animation-state: 1;
          animation: changeAnimationState 100s steps(5) infinite;
        }
        
        .header-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .logo {
          flex: 0 0 auto;
          position: relative;
        }
        
        .logo h1 {
          font-size: 1.6rem;
          font-weight: 600;
          margin: 0;
          padding: 0;
          font-family: 'Work Sans', sans-serif;
          letter-spacing: -0.01em;
          position: relative;
          transition: transform 0.2s ease;
        }
        
        .name-header {
          display: flex;
          align-items: center;
          font-family: 'Roboto Mono', monospace;
          font-size: 1.6rem;
          color: var(--current-color);
          position: relative;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          letter-spacing: -0.03em;
          gap: 8px;
        }
        
        .first-name {
          color: var(--current-color);
          font-weight: 500;
          transition: none;
          margin-right: 0.05em;
          display: inline-block;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        
        .last-name {
          font-weight: 500;
          color: var(--current-color);
          transition: none;
          padding-right: 5.5rem;
          display: inline-block;
          position: relative;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        
        .ticker-line {
          position: absolute;
          bottom: -2px;
          left: 0;
          height: 2px;
          background: var(--current-color);
          width: 100%;
          transition: none;
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
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        
        .theme-toggle:hover {
          background-color: var(--hover-bg);
        }
        
        @keyframes changeAnimationState {
          0% {
            --animation-state: 1;
            --current-color: #16a34a;
            --current-percentage: "+8.4%";
          }
          20% {
            --animation-state: 2;
            --current-color: #ef4444;
            --current-percentage: "-12.6%";
          }
          40% {
            --animation-state: 3;
            --current-color: #16a34a;
            --current-percentage: "+5.1%";
          }
          60% {
            --animation-state: 4;
            --current-color: #ef4444;
            --current-percentage: "-7.3%";
          }
          80% {
            --animation-state: 5;
            --current-color: #16a34a;
            --current-percentage: "+10.2%";
          }
          100% {
            --animation-state: 1;
            --current-color: #16a34a;
            --current-percentage: "+8.4%";
          }
        }
        
        .logo h1:hover {
          transform: translateY(-2px);
        }
        
        /* Ticker line animation */
        .logo h1::before {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, 
            #16a34a 0%, #16a34a 40%, 
            #dc2626 60%, #dc2626 100%);
          background-size: 200% 100%;
          animation: tickerLine 32s linear infinite;
          transform-origin: left;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        @keyframes tickerLine {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: -200% 0%;
          }
        }
        
        .logo h1:hover::before {
          opacity: 1;
        }
        
        /* Remove the previous chart animation */
        .logo h1::after {
          display: none;
        }
        
        .nav {
          display: flex;
          gap: 1.5rem;
          margin-left: auto;
          align-items: center;
        }
        
        .nav a {
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--nav-text);
          transition: all 0.2s ease;
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .nav a:hover, .nav a.active {
          color: var(--nav-text-hover);
          background-color: var(--nav-hover-bg);
        }
        
        main {
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 0.5rem 1.5rem 2rem;
        }
        
        .footer {
          border-top: 1px solid var(--border-color);
          padding: 1.5rem 0;
          color: var(--footer-text);
        }
        
        .footer-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .nav {
            margin-top: 1rem;
            margin-left: 0;
            gap: 1rem;
          }
          
          .first-name {
            margin-right: 0.15rem;
            letter-spacing: -0.02em;
          }
          
          .last-name {
            letter-spacing: -0.02em;
          }
          
          /* Fix for mobile: adjust the percentage display */
          .last-name::after {
            position: relative;
            display: inline-flex;
            right: auto;
            margin-left: 0.75rem;
            top: -1px;
            transform: none;
          }
          
          /* Simplify animations for mobile */
          .header {
            /* Use a simpler animation cycle with fewer steps for better performance */
            animation: changeAnimationStateMobile 60s steps(3) infinite;
          }
          
          /* Disable hover animations on mobile for better performance */
          .logo h1:hover {
            transform: none;
          }
          
          .logo h1::before {
            display: none;
          }
          
          /* Custom animation keyframes for mobile */
          @keyframes changeAnimationStateMobile {
            0% {
              --animation-state: 1;
              --current-color: #16a34a;
              --current-percentage: "+8.4%";
            }
            33% {
              --animation-state: 2;
              --current-color: #ef4444;
              --current-percentage: "-7.3%";
            }
            66% {
              --animation-state: 3;
              --current-color: #16a34a;
              --current-percentage: "+5.1%";
            }
            100% {
              --animation-state: 1;
              --current-color: #16a34a;
              --current-percentage: "+8.4%";
            }
          }
          
          /* For very small screens, adjust the header further */
          @media (max-width: 375px) {
            .name-header {
              font-size: 1.3rem;
            }
            
            .last-name::after {
              font-size: 0.65rem;
              margin-left: 0.5rem;
              min-width: 3.8rem;
              height: 1.2rem;
            }
          }
          
          /* Use hardware acceleration for animations */
          .name-header {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: color;
          }
          
          .last-name::after {
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: color;
            transition: color 0.5s ease;
          }
        }

        .last-name::after {
          content: var(--current-percentage);
          display: inline-flex;
          justify-content: center;
          align-items: center;
          font-size: 0.75rem;
          padding: 1px 4px;
          border-radius: 3px;
          margin-left: 1.5rem;
          position: absolute;
          right: 0.4rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--current-color);
          border: 1px solid;
          transition: none;
          font-family: 'Roboto Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          height: 1.3rem;
          min-width: 4.2rem;
          text-align: center;
          z-index: 10;
          letter-spacing: -0.01em;
        }
      `}</style>
    </div>
  );
} 