// src/pages/Dashboard.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="dashboard-actions">
          <span className="user-badge">👤 {user?.name}</span>
          <button className="logout-btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <span className="stat-value">1,234</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-value">$56,789</span>
            <span className="stat-label">Revenue</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-content">
            <span className="stat-value">342</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div className="stat-content">
            <span className="stat-value">4.8</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.name}!</h2>
          <p>Role: <span className="role-badge">{user?.role}</span></p>
          <p>Email: {user?.email}</p>
          <p className="welcome-message">
            You are now logged in and can access protected content.
            The authentication state is managed globally with Context API.
          </p>
        </div>

        <div className="activity-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>🔄 Logged in at {new Date().toLocaleTimeString()}</li>
            <li>📄 Viewed dashboard</li>
            <li>📨 Checked messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;