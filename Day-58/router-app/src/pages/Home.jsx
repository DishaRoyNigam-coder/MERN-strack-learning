// src/pages/Home.jsx

import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="page home-page">
      <div className="hero">
        <h1>🏠 Welcome to Our App</h1>
        <p>This is the home page. Explore our site using the navigation above.</p>
        <div className="hero-actions">
          <Link to="/about" className="btn-primary">Learn About Us</Link>
          <Link to="/contact" className="btn-secondary">Get in Touch</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <span className="feature-icon">📱</span>
          <h3>Responsive</h3>
          <p>Works on all devices and screen sizes.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>Fast</h3>
          <p>Client-side routing for instant navigation.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h3>Secure</h3>
          <p>Built with modern web best practices.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;