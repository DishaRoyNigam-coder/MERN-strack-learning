// src/components/BuggyComponent.jsx

import { useState } from 'react';
import './BuggyComponent.css';

function BuggyComponent() {
  const [shouldCrash, setShouldCrash] = useState(false);

  // This component will throw an error when the button is clicked
  if (shouldCrash) {
    throw new Error('💥 This component crashed intentionally!');
  }

  return (
    <div className="buggy-component">
      <h3>🧪 Test Component</h3>
      <p>This component is used to test Error Boundaries.</p>
      <button
        className="crash-btn"
        onClick={() => setShouldCrash(true)}
      >
        💥 Click to Crash
      </button>
    </div>
  );
}

export default BuggyComponent;