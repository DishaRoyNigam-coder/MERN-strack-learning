// src/App.jsx

import React, { useState, useCallback, useMemo } from 'react';
import ProfileHeader from './components/ProfileHeader';
import PostList from './components/PostList';
import Sidebar from './components/Sidebar';
import './App.css';

// Generate sample data
const generatePosts = () => {
  const titles = [
    'My first post!',
    'React is amazing',
    'Learning about memoization',
    'JavaScript tips and tricks',
    'CSS Grid vs Flexbox',
  ];
  const bodies = [
    'Today I learned about React.memo. It prevents unnecessary re-renders!',
    'React is a JavaScript library for building user interfaces.',
    'Memoization is a technique that caches the results of expensive operations.',
    'Here are some tips for writing clean JavaScript code.',
    'CSS Grid is great for layouts, Flexbox is great for alignment.',
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    body: bodies[i % bodies.length],
    author: ['Alice', 'Bob', 'Carol', 'David', 'Eve'][i % 5],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString(),
    likes: Math.floor(Math.random() * 100),
  }));
};

const generateFriends = () => {
  const names = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace'];
  const avatars = ['😊', '😎', '🤩', '🥳', '😺', '🦊', '🐼'];
  return names.map((name, i) => ({
    id: i + 1,
    name,
    avatar: avatars[i % avatars.length],
    online: Math.random() > 0.4,
  }));
};

function App() {
  // State
  const [user, setUser] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Passionate developer learning React.',
    posts: 15,
    followers: 230,
    likes: 180,
  });

  const [posts, setPosts] = useState(generatePosts());
  const [friends, setFriends] = useState(generateFriends());

  // Track renders
  const [renderCount, setRenderCount] = useState(0);

  // Update render count
  const incrementRender = useCallback(() => {
    setRenderCount((prev) => prev + 1);
  }, []);

  // --- Handlers ---

  // Edit user (triggers re-render)
  const handleEditProfile = useCallback(() => {
    setUser((prev) => ({
      ...prev,
      name: `${prev.name.split(' ')[0]} Doe ${Math.floor(Math.random() * 100)}`,
      bio: `Updated bio ${new Date().toLocaleTimeString()}`,
    }));
  }, []);

  // Like a post
  const handleLike = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  }, []);

  // Delete a post
  const handleDelete = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  // Add a new post
  const handleAddPost = useCallback(() => {
    const newPost = {
      id: posts.length + 1,
      title: `New Post ${posts.length + 1}`,
      body: `This is post number ${posts.length + 1}.`,
      author: user.name,
      date: new Date().toLocaleDateString(),
      likes: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
  }, [posts.length, user.name]);

  // Friend click
  const handleFriendClick = useCallback((friendId) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === friendId
          ? { ...friend, online: !friend.online }
          : friend
      )
    );
  }, []);

  // Reset all posts (triggers re-render)
  const handleResetPosts = useCallback(() => {
    setPosts(generatePosts());
  }, []);

  // Toggle friend statuses (triggers re-render)
  const handleToggleAllFriends = useCallback(() => {
    setFriends((prev) =>
      prev.map((friend) => ({ ...friend, online: !friend.online }))
    );
  }, []);

  // --- Memoized stats ---
  const totalLikes = useMemo(() => {
    return posts.reduce((sum, post) => sum + post.likes, 0);
  }, [posts]);

  const activeFriends = useMemo(() => {
    return friends.filter((f) => f.online).length;
  }, [friends]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>📊 Profile Dashboard</h1>
        <div className="header-stats">
          <span>🔄 Renders: {renderCount}</span>
          <span>📝 Posts: {posts.length}</span>
          <span>❤️ Total Likes: {totalLikes}</span>
          <span>🟢 Online Friends: {activeFriends}/{friends.length}</span>
        </div>
        <button className="render-btn" onClick={incrementRender}>
          🔄 Trigger Re-render
        </button>
      </div>

      <div className="dashboard">
        <div className="dashboard-main">
          {/* Profile Header – Memoized */}
          <ProfileHeader
            user={user}
            onEdit={handleEditProfile}
          />

          <div className="dashboard-actions">
            <button className="action-btn" onClick={handleAddPost}>
              ➕ Add Post
            </button>
            <button className="action-btn secondary" onClick={handleResetPosts}>
              🔄 Reset Posts
            </button>
          </div>

          {/* Post List – Memoized */}
          <PostList
            posts={posts}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        </div>

        <div className="dashboard-sidebar">
          {/* Sidebar – Memoized */}
          <Sidebar
            friends={friends}
            onFriendClick={handleFriendClick}
          />
          <button className="sidebar-action" onClick={handleToggleAllFriends}>
            🔄 Toggle All Friends
          </button>
        </div>
      </div>

      <div className="debug-info">
        <details>
          <summary>🔍 Debug Info: Memoization Status</summary>
          <div className="debug-content">
            <p><strong>ProfileHeader:</strong> {React.memo ? '✅ Memoized' : '❌ Not memoized'}</p>
            <p><strong>PostList:</strong> {React.memo ? '✅ Memoized' : '❌ Not memoized'}</p>
            <p><strong>PostItem:</strong> {React.memo ? '✅ Memoized (custom comparison)' : '❌ Not memoized'}</p>
            <p><strong>Sidebar:</strong> {React.memo ? '✅ Memoized' : '❌ Not memoized'}</p>
            <p><strong>Post Count:</strong> {posts.length}</p>
            <p><strong>Friend Count:</strong> {friends.length}</p>
            <p><strong>Total Likes:</strong> {totalLikes}</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default App;