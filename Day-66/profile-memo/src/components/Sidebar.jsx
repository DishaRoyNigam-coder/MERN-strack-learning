// src/components/Sidebar.jsx

import React from 'react';
import './Sidebar.css';

function Sidebar({ friends, onFriendClick }) {
  console.log('🔄 Sidebar rendered');

  return (
    <div className="sidebar">
      <h3>👥 Friends</h3>
      <ul className="friend-list">
        {friends.map((friend) => (
          <li key={friend.id} className="friend-item">
            <button onClick={() => onFriendClick(friend.id)}>
              <span className="friend-avatar">{friend.avatar}</span>
              <span className="friend-name">{friend.name}</span>
              <span className="friend-status">{friend.online ? '🟢' : '⚪'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 🔥 Memoize the component
export default React.memo(Sidebar);