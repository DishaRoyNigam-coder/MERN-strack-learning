// src/App.jsx (updated with async)

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  incrementByAmount,
  fetchCountAsync,
  incrementAsync,
  decrementAsync,
  resetAsync,
  selectCount,
  selectStatus,
  selectError,
} from './store/counterSlice';
import './App.css';

function App() {
  const count = useSelector(selectCount);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const dispatch = useDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  // Fetch initial count on mount
  useEffect(() => {
    dispatch(fetchCountAsync(10));
  }, [dispatch]);

  const isLoading = status === 'loading';

  return (
    <div className="app">
      <div className="counter-container">
        <h1>🔢 Redux Counter</h1>
        <p className="subtitle">With Async Thunks</p>

        <div className="status-badge">
          Status: <span className={`status-${status}`}>{status}</span>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="counter-display">
          <span className="counter-value">
            {isLoading ? '...' : count}
          </span>
        </div>

        <div className="counter-controls">
          <button
            className="btn btn-decrement"
            onClick={() => dispatch(decrementAsync())}
            disabled={isLoading}
          >
            -
          </button>
          <button
            className="btn btn-reset"
            onClick={() => dispatch(resetAsync())}
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            className="btn btn-increment"
            onClick={() => dispatch(incrementAsync())}
            disabled={isLoading}
          >
            +
          </button>
        </div>

        <div className="counter-input">
          <input
            type="number"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
            className="amount-input"
            disabled={isLoading}
          />
          <button
            className="btn btn-add"
            onClick={() => dispatch(incrementByAmount(incrementValue))}
            disabled={isLoading}
          >
            Add Amount
          </button>
        </div>

        <div className="counter-actions">
          <button
            className="btn btn-fetch"
            onClick={() => dispatch(fetchCountAsync(15))}
            disabled={isLoading}
          >
            🔄 Fetch Count (15)
          </button>
        </div>

        <div className="counter-info">
          <p>💡 Redux DevTools enabled</p>
          <p className="small">Async thunks simulate API calls with delays</p>
        </div>
      </div>
    </div>
  );
}

export default App;