// src/components/BackButton.jsx

import { useNavigate } from 'react-router-dom';
import './BackButton.css';

function BackButton({ fallbackPath = '/', label = '← Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if we can go back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button className="back-button" onClick={handleBack}>
      {label}
    </button>
  );
}

export default BackButton;