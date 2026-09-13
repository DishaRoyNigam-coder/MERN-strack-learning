// src/App.jsx

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount, reset, selectCount } from './store/counterSlice';
import './App.css';

function App() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div className="app">
      <div className="counter-container">
        <h1>🔢 Redux Counter</h1>
        <p className="subtitle">Built with Redux Toolkit</p>

        <div className="counter-display">
          <span className="counter-value">{count}</span>
        </div>

        <div className="counter-controls">
          <button className="btn btn-decrement" onClick={() => dispatch(decrement())}>
            -
          </button>
          <button className="btn btn-reset" onClick={() => dispatch(reset())}>
            Reset
          </button>
          <button className="btn btn-increment" onClick={() => dispatch(increment())}>
            +
          </button>
        </div>

        <div className="counter-input">
          <input
            type="number"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
            className="amount-input"
          />
          <button
            className="btn btn-add"
            onClick={() => dispatch(incrementByAmount(incrementValue))}
          >
            Add Amount
          </button>
        </div>

        <div className="counter-info">
          <p>💡 Redux DevTools enabled – open the browser console!</p>
          <p className="small">State is managed by Redux Toolkit</p>
        </div>
      </div>
    </div>
  );
}

export default App;