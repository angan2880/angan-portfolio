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
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const layoutRef = useRef(null);

  // Navigation items config
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Essays', path: '/essays' },
    { label: 'Clippings', path: '/clippings' },
    { label: 'About', path: '/about' }
  ];

  // Get focusable content elements (scoped to main content only, excludes nav)
  const getContentElements = useCallback(() => {
    const main = document.getElementById('main-content');
    if (!main) return [];
    const selector = 'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), input, select, textarea, [tabindex="0"]';
    return Array.from(main.querySelectorAll(selector)).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('disabled');
    });
  }, []);

  // After mounting, we can show the theme toggle since we know what theme is active
  useEffect(() => {
    setMounted(true);
    navRefs.current = navRefs.current.slice(0, navItems.length);
  }, []);
  
  const isActive = (path) => {
    return router.pathname === path;
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
        // Enter keyboard mode, focus first nav item
        setKeyboardMode(true);
        setFocusedNavIndex(0);
        setCurrentFocusIndex(-1);
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
          // Move from nav to first content element
          e.preventDefault();
          setFocusedNavIndex(-1);
          const contentEls = getContentElements();
          if (contentEls.length > 0) {
            setCurrentFocusIndex(0);
            contentEls[0].focus();
            contentEls[0].scrollIntoView({ block: 'nearest' });
          }
          return;
        }
        // ArrowUp in nav: do nothing (already at top)
        e.preventDefault();
        return;
      }

      // Content area navigation (sequential up/down)
      const contentEls = getContentElements();
      if (contentEls.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = currentFocusIndex + 1;
        if (nextIndex < contentEls.length) {
          setCurrentFocusIndex(nextIndex);
          contentEls[nextIndex].focus();
          contentEls[nextIndex].scrollIntoView({ block: 'nearest' });
        }
        // At bottom: do nothing, stay on last element
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentFocusIndex <= 0) {
          // At top of content, move back to nav
          setCurrentFocusIndex(-1);
          setFocusedNavIndex(0);
          if (document.activeElement) document.activeElement.blur();
        } else {
          const prevIndex = currentFocusIndex - 1;
          setCurrentFocusIndex(prevIndex);
          contentEls[prevIndex].focus();
          contentEls[prevIndex].scrollIntoView({ block: 'nearest' });
        }
      }
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

    // Space key to activate focused content elements
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
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
    }
  }, [focusedNavIndex, navItems.length, router, resolvedTheme, setTheme, keyboardMode, currentFocusIndex, getContentElements]);

  // Add event listeners
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const handleKeyDownEvent = (e) => handleKeyDown(e);
      const handleMouseDownEvent = () => {
        setKeyboardMode(false);
        setFocusedNavIndex(-1);
        setCurrentFocusIndex(-1);
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
    <div ref={layoutRef} className={keyboardMode ? 'keyboard-mode' : ''}>
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

        .logo-mark:active {
          opacity: 0.85;
          transform: scale(1.05);
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
        
        .theme-toggle:active {
          background-color: var(--hover-bg);
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

        .nav a:active {
          color: var(--nav-text-hover);
          background-color: var(--nav-hover-bg);
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