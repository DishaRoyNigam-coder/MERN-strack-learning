// src/components/ThemeToggle.jsx

import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="toggle-icon">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="toggle-label">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

export default ThemeToggle;