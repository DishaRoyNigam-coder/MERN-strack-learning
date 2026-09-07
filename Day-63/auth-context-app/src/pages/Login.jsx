// src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, isLoggingIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is already set in the context
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" className="login-btn" disabled={isLoggingIn}>
            {isLoggingIn ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>

          <div className="demo-credentials">
            <p>Demo Credentials:</p>
            <div className="cred-row">
              <span>Admin:</span>
              <code>admin@example.com / admin123</code>
            </div>
            <div className="cred-row">
              <span>User:</span>
              <code>user@example.com / user123</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;