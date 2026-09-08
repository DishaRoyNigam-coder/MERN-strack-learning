// src/components/ProfileHeader.jsx

import React from 'react';
import './ProfileHeader.css';

function ProfileHeader({ user, onEdit }) {
  console.log('🔄 ProfileHeader rendered');

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        <span className="avatar-emoji">👤</span>
        <span className="online-dot"></span>
      </div>
      <div className="profile-info">
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        <p className="profile-bio">{user.bio}</p>
        <div className="profile-stats">
          <span>📝 {user.posts} posts</span>
          <span>👥 {user.followers} followers</span>
          <span>❤️ {user.likes} likes</span>
        </div>
      </div>
      <button className="edit-btn" onClick={onEdit}>
        ✏️ Edit Profile
      </button>
    </div>
  );
}

// 🔥 Memoize the component to prevent unnecessary re-renders
export default React.memo(ProfileHeader);