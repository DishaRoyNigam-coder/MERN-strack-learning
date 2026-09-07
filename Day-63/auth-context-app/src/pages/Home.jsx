// src/pages/Home.jsx

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🚀 Welcome to Auth Demo</h1>
        <p>Learn how Context API manages authentication globally.</p>
        <div className="hero-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
              <span className="user-greeting">👋 Welcome back, {user?.name}!</span>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
              <span className="guest-message">Try logging in with demo credentials</span>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature">
          <span className="feature-emoji">🔐</span>
          <h3>Authentication</h3>
          <p>Login and logout with simulated user authentication.</p>
        </div>
        <div className="feature">
          <span className="feature-emoji">🌐</span>
          <h3>Global State</h3>
          <p>User data is available across all components using Context.</p>
        </div>
        <div className="feature">
          <span className="feature-emoji">💾</span>
          <h3>Persistence</h3>
          <p>User session is saved to localStorage.</p>
        </div>
        <div className="feature">
          <span className="feature-emoji">🛡️</span>
          <h3>Protected Routes</h3>
          <p>Dashboard and Profile are only accessible when logged in.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;