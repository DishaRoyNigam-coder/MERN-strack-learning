// src/context/ThemeContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create the Provider component
export function ThemeProvider({ children }) {
  // State for theme
  const [theme, setTheme] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved; // 'light' or 'dark'
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Apply class to document element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Value object
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create the custom hook for consuming context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. Export the Context (for advanced use cases)
export default ThemeContext;