// src/pages/Profile.jsx

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    updateUser({ name, email });
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 Profile</h1>
        <div className="profile-actions">
          <button className="logout-btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <span className="avatar-emoji">👤</span>
        </div>

        <div className="profile-info">
          {isEditing ? (
            <div className="profile-edit">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="profile-edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  💾 Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="profile-detail">
                <span className="detail-label">Name</span>
                <span className="detail-value">{user?.name}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Role</span>
                <span className="detail-value role-tag">{user?.role}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Status</span>
                <span className="detail-value status-badge">✅ Active</span>
              </div>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;