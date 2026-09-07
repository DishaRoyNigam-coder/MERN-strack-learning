// src/App.jsx

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header className="app-header">
          <h1>🌓 Theme Switcher</h1>
          <ThemeToggle />
        </header>

        <main className="app-main">
          <section className="hero">
            <h2>Welcome to the Theme Switcher Demo</h2>
            <p>
              This app demonstrates the Context API for managing theme state.
              Click the button above to toggle between dark and light mode.
            </p>
          </section>

          <section className="features">
            <div className="feature-card">
              <span className="feature-icon">🎨</span>
              <h3>Context API</h3>
              <p>Global state management without prop drilling.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💾</span>
              <h3>localStorage</h3>
              <p>Your theme preference is saved automatically.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌙</span>
              <h3>Dark Mode</h3>
              <p>Easy on the eyes for late-night coding.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3>Performance</h3>
              <p>No unnecessary re-renders with Context.</p>
            </div>
          </section>

          <section className="demo-section">
            <h3>Context Value Demo</h3>
            <p>Components can access the theme data anywhere in the tree.</p>
            <div className="demo-grid">
              <ThemeConsumerDemo />
              <ThemeConsumerDemo />
              <ThemeConsumerDemo />
            </div>
          </section>
        </main>

        <footer className="app-footer">
          <p>© 2026 Theme Switcher. Built with React Context API.</p>
          <ThemeToggle />
        </footer>
      </div>
    </ThemeProvider>
  );
}

// A component that consumes the theme context
function ThemeConsumerDemo() {
  const { theme, isDark } = useTheme();

  return (
    <div className={`demo-card ${isDark ? 'dark-card' : 'light-card'}`}>
      <span className="demo-emoji">{isDark ? '🌙' : '☀️'}</span>
      <p>Current theme: <strong>{theme}</strong></p>
      <small>This component uses useTheme()</small>
    </div>
  );
}

// Import the hook for use in this file
import { useTheme } from './context/ThemeContext';

export default App;