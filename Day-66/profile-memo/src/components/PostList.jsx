// src/components/PostList.jsx

import React from 'react';
import PostItem from './PostItem';
import './PostList.css';

function PostList({ posts, onLike, onDelete }) {
  console.log('🔄 PostList rendered');

  if (posts.length === 0) {
    return (
      <div className="post-list-empty">
        <span className="empty-icon">📭</span>
        <p>No posts yet</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// 🔥 Memoize the component
export default React.memo(PostList);