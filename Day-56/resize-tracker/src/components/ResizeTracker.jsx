// src/components/ResizeTracker.jsx

import { useState, useEffect } from 'react';
import './ResizeTracker.css';

function ResizeTracker() {
  // --- State ---
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [resizeCount, setResizeCount] = useState(0);
  const [isTracking, setIsTracking] = useState(true);

  // --- Effect 1: Track window resize (with cleanup) ---
  useEffect(() => {
    // This runs on mount

    // Handler function
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setResizeCount((prev) => prev + 1);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // 🧹 CLEANUP: Remove event listener on unmount or before next effect
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('🧹 Resize listener removed');
    };
  }, []); // Empty dependency array = run once on mount

  // --- Effect 2: Log resize count (runs when resizeCount changes) ---
  useEffect(() => {
    if (resizeCount > 0) {
      console.log(`📊 Window resized ${resizeCount} times`);
    }
  }, [resizeCount]);

  // --- Effect 3: Update document title (demonstrates cleanup) ---
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `📐 ${windowSize.width} × ${windowSize.height}`;

    // 🧹 Restore original title on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [windowSize]);

  // --- Effect 4: Toggle tracking (with conditional cleanup) ---
  useEffect(() => {
    if (!isTracking) {
      // When tracking is paused, we don't need to do anything special
      // But we could add a different behavior here
      console.log('⏸️ Resize tracking paused');
    }
  }, [isTracking]);

  // --- Handlers ---
  const toggleTracking = () => {
    setIsTracking((prev) => !prev);
  };

  const resetCount = () => {
    setResizeCount(0);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="resize-tracker">
      <header className="tracker-header">
        <h1>📐 Window Resize Tracker</h1>
        <p>Demonstrating useEffect cleanup with event listeners</p>
        <span className="badge">🧹 Cleanup: removeEventListener</span>
      </header>

      <div className="tracker-grid">
        {/* --- Window Size Card --- */}
        <div className="tracker-card size-card">
          <h3>🪟 Window Size</h3>
          <div className="size-display">
            <div className="size-item">
              <span className="size-label">Width</span>
              <span className="size-value">{windowSize.width}px</span>
            </div>
            <div className="size-item">
              <span className="size-label">Height</span>
              <span className="size-value">{windowSize.height}px</span>
            </div>
          </div>
          <div className="size-aspect">
            Aspect Ratio: {(windowSize.width / windowSize.height).toFixed(2)}
          </div>
        </div>

        {/* --- Stats Card --- */}
        <div className="tracker-card stats-card">
          <h3>📊 Resize Stats</h3>
          <div className="stats-display">
            <div className="stat-item">
              <span className="stat-label">Resize Count</span>
              <span className="stat-value">{resizeCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status</span>
              <span className={`stat-status ${isTracking ? 'active' : 'paused'}`}>
                {isTracking ? '🟢 Tracking' : '⏸️ Paused'}
              </span>
            </div>
          </div>
          <div className="tracker-actions">
            <button className="tracker-btn toggle-btn" onClick={toggleTracking}>
              {isTracking ? '⏸️ Pause Tracking' : '▶️ Resume Tracking'}
            </button>
            <button className="tracker-btn reset-btn" onClick={resetCount}>
              🔄 Reset Count
            </button>
          </div>
        </div>
      </div>

      {/* --- Visual Indicator --- */}
      <div className="visual-indicator">
        <div className="indicator-bar">
          <div
            className="indicator-fill"
            style={{
              width: `${Math.min((resizeCount / 20) * 100, 100)}%`,
              background: isTracking ? '#3b82f6' : '#94a3b8',
            }}
          />
        </div>
        <span className="indicator-label">
          Resize intensity: {Math.min(resizeCount, 20)} / 20
        </span>
      </div>

      {/* --- Effect Demo Section --- */}
      <div className="demo-section">
        <h3>🔬 useEffect Demos</h3>
        <div className="demo-grid">
          <div className="demo-card">
            <h4>1. Mount (empty deps)</h4>
            <p>Runs once on mount</p>
            <pre>
              <code>
{`useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);`}
              </code>
            </pre>
          </div>

          <div className="demo-card">
            <h4>2. Dependency Change</h4>
            <p>Runs when resizeCount changes</p>
            <pre>
              <code>
{`useEffect(() => {
  console.log('Count changed:', resizeCount);
}, [resizeCount]);`}
              </code>
            </pre>
          </div>

          <div className="demo-card">
            <h4>3. Cleanup on Unmount</h4>
            <p>Restores original document title</p>
            <pre>
              <code>
{`useEffect(() => {
  document.title = \`New title\`;
  return () => {
    document.title = original;
  };
}, [windowSize]);`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* --- Log Display --- */}
      <div className="log-section">
        <details>
          <summary>📋 Effect Logs (open console for more)</summary>
          <div className="log-content">
            <p>✅ Resize listener added on mount</p>
            <p>🧹 Listener removed on unmount</p>
            <p>📊 Resize count tracked in state</p>
            <p>📐 Document title updates with window size</p>
            <p>⏸️ Tracking can be paused/resumed</p>
          </div>
        </details>
      </div>

      <footer className="tracker-footer">
        <p>
          💡 <strong>Key takeaway:</strong> Always clean up event listeners, timers, and subscriptions
          to prevent memory leaks.
        </p>
        <p>
          🧹 The <code>useEffect</code> cleanup function runs on unmount and before the next effect.
        </p>
      </footer>
    </div>
  );
}

export default ResizeTracker;
