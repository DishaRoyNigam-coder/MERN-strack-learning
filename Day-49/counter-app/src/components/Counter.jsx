// src/components/Counter.jsx

import { useState } from 'react';
import './Counter.css';

function Counter({ initialValue = 0, min = -Infinity, max = Infinity, step = 1 }) {
  // State: count
  const [count, setCount] = useState(initialValue);

  // State: history of changes
  const [history, setHistory] = useState([]);

  // State: whether the counter is locked
  const [isLocked, setIsLocked] = useState(false);

  // Derived state (computed from other state)
  const isAtMin = count <= min;
  const isAtMax = count >= max;

  // Helper function to add to history
  const addToHistory = (action, previousValue, newValue) => {
    setHistory(prev => [
      { action, previousValue, newValue, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Keep only last 10 entries
    ]);
  };

  // --- Increment ---
  const increment = () => {
    if (isLocked) return;
    setCount(prevCount => {
      const newValue = Math.min(prevCount + step, max);
      addToHistory('Increment', prevCount, newValue);
      return newValue;
    });
  };

  // --- Decrement ---
  const decrement = () => {
    if (isLocked) return;
    setCount(prevCount => {
      const newValue = Math.max(prevCount - step, min);
      addToHistory('Decrement', prevCount, newValue);
      return newValue;
    });
  };

  // --- Reset ---
  const reset = () => {
    if (isLocked) return;
    setCount(prevCount => {
      addToHistory('Reset', prevCount, initialValue);
      return initialValue;
    });
  };

  // --- Set specific value ---
  const setValue = (value) => {
    if (isLocked) return;
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    const clampedValue = Math.min(Math.max(numValue, min), max);
    setCount(prevCount => {
      addToHistory('Set Value', prevCount, clampedValue);
      return clampedValue;
    });
  };

  // --- Toggle lock ---
  const toggleLock = () => {
    setIsLocked(prev => !prev);
  };

  // --- Clear history ---
  const clearHistory = () => {
    setHistory([]);
  };

  // Determine the color of the count based on value
  const getCountColor = () => {
    if (count === 0) return 'neutral';
    if (count > 0) return 'positive';
    return 'negative';
  };

  return (
    <div className="counter-container">
      <div className="counter-card">
        <h2>Counter</h2>

        {/* Lock status */}
        <div className="lock-status">
          {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
          <button onClick={toggleLock} className="lock-btn">
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
        </div>

        {/* Display */}
        <div className={`counter-display ${getCountColor()}`}>
          <span className="counter-value">{count}</span>
        </div>

        {/* Controls */}
        <div className="counter-controls">
          <button
            onClick={decrement}
            disabled={isLocked || isAtMin}
            className="ctrl-btn"
          >
            −{step}
          </button>

          <button
            onClick={reset}
            disabled={isLocked || count === initialValue}
            className="ctrl-btn reset-btn"
          >
            ↺
          </button>

          <button
            onClick={increment}
            disabled={isLocked || isAtMax}
            className="ctrl-btn"
          >
            +{step}
          </button>
        </div>

        {/* Step size indicator */}
        <div className="step-indicator">
          Step: {step} | Min: {min} | Max: {max === Infinity ? '∞' : max}
        </div>

        {/* Set custom value */}
        <div className="set-value">
          <input
            type="number"
            placeholder="Set value..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setValue(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <span>Press Enter</span>
        </div>

        {/* History */}
        <div className="history-section">
          <div className="history-header">
            <span>📋 History</span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="clear-history-btn">
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="history-empty">No changes yet</p>
          ) : (
            <ul className="history-list">
              {history.map((entry, index) => (
                <li key={index} className="history-item">
                  <span className="history-action">{entry.action}</span>
                  <span className="history-values">
                    {entry.previousValue} → {entry.newValue}
                  </span>
                  <span className="history-time">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Counter;