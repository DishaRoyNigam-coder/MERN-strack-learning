// src/App.jsx

import './App.css';
import Counter from './components/Counter';

function App() {
  return (
    <div className="app">
      <Counter
        initialValue={0}
        min={-10}
        max={10}
        step={1}
      />
    </div>
  );
}

export default App;