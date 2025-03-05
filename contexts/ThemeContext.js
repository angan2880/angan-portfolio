import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check saved preference or use system preference as fallback
    const shouldUseDarkMode = savedTheme === 'true' || (savedTheme === null && prefersDark);
    
    setIsDarkMode(shouldUseDarkMode);
    applyTheme(shouldUseDarkMode);
    setIsInitialized(true);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only apply if user hasn't explicitly chosen a theme
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };
    
    // Add event listener (with compatibility for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  // Function to toggle theme
  const toggleTheme = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    localStorage.setItem('darkMode', newThemeValue.toString());
    applyTheme(newThemeValue);
  };
  
  // Apply theme class to document
  const applyTheme = (dark) => {
    if (typeof document === 'undefined') return;
    
    if (dark) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  // Only render children once we've initialized the theme to prevent flashing
  if (!isInitialized && typeof window !== 'undefined') {
    return null;
  }
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 