// src/components/PostItem.jsx

import React from 'react';
import './PostItem.css';

function PostItem({ post, onLike, onDelete }) {
  console.log(`🔄 PostItem ${post.id} rendered`);

  const handleLike = () => onLike(post.id);
  const handleDelete = () => onDelete(post.id);

  return (
    <div className="post-item">
      <div className="post-content">
        <h4 className="post-title">{post.title}</h4>
        <p className="post-body">{post.body}</p>
        <div className="post-meta">
          <span className="post-author">✍️ {post.author}</span>
          <span className="post-date">📅 {post.date}</span>
        </div>
      </div>
      <div className="post-actions">
        <button className="like-btn" onClick={handleLike}>
          ❤️ {post.likes}
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          🗑️
        </button>
      </div>
    </div>
  );
}

// 🔥 Memoize the component
// Uses custom comparison to only re-render when the post's likes change
export default React.memo(PostItem, (prevProps, nextProps) => {
  // Return true if the props are equal (skip re-render)
  // Return false if the props are different (re-render)
  const prev = prevProps.post;
  const next = nextProps.post;

  // Only re-render if:
  // - The post ID changes
  // - The likes change
  // - The post content changes (unlikely)
  return (
    prev.id === next.id &&
    prev.likes === next.likes &&
    prev.title === next.title &&
    prev.body === next.body &&
    prev.author === next.author &&
    prev.date === next.date
  );
});