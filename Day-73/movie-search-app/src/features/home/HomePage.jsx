// src/pages/HomePage.jsx

import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>🎬 Movie Search</h1>
        <p>Discover your favorite movies, actors, and more.</p>
        <div className="home-actions">
          <Link to="/search" className="home-btn primary">
            🔍 Search Movies
          </Link>
          <Link to="/favorites" className="home-btn secondary">
            ❤️ View Favorites
          </Link>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <span className="feature-emoji">🔍</span>
          <h3>Search</h3>
          <p>Find any movie by title, actor, or director.</p>
        </div>
        <div className="feature-card">
          <span className="feature-emoji">❤️</span>
          <h3>Favorites</h3>
          <p>Save movies to your favorites list.</p>
        </div>
        <div className="feature-card">
          <span className="feature-emoji">⚙️</span>
          <h3>Settings</h3>
          <p>Customize your experience with themes and preferences.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;