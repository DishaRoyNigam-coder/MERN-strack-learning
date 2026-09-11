// src/components/LoadingSpinner.jsx

import './LoadingSpinner.css';

export function LoadingSpinner({ size = 'medium', label = 'Loading...' }) {
  const sizeClass = `spinner-${size}`;
  return (
    <div className="loading-spinner-container">
      <div className={`spinner ${sizeClass}`}></div>
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner"></div>
      <p>Loading page...</p>
    </div>
  );
}