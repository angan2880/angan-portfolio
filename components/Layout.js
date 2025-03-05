import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

export default function Layout({ children, title = "Angan Sarker", description = "Investment Analyst at John Hancock Investment Management" }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we can show the theme toggle since we know what theme is active
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div>
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
            <Link href="/" className={isActive('/') ? 'active' : ''}>
              HOME
            </Link>
            <Link href="/essays" className={isActive('/essays') ? 'active' : ''}>
              ESSAYS
            </Link>
            <Link href="/interesting" className={isActive('/interesting') ? 'active' : ''}>
              INTERESTING
            </Link>
            {/* Hidden for future development
            <Link href="/portfolio">
              PORTFOLIO
            </Link>
            */}
            <Link href="/about" className={isActive('/about') ? 'active' : ''}>
              ABOUT
            </Link>
            {/* Hidden for future development
            <Link href="/search">
              SEARCH
            </Link>
            */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="theme-toggle"
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mounted && (theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ))}
            </button>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Angan Sarker</p>
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
          transition: color 0.2s ease;
        }
        
        .nav a:hover, .nav a.active {
          color: var(--nav-text-hover);
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