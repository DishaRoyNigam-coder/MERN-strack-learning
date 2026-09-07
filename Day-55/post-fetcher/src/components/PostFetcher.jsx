// src/components/PostFetcher.jsx

import { useState, useEffect } from 'react';
import './PostFetcher.css';

function PostFetcher() {
  // --- State ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- Fetch Function ---
  const fetchPosts = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    // Create an AbortController for cleanup
    const abortController = new AbortController();

    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts?_limit=10',
        {
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      // Ignore abort errors (they're expected on cleanup)
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      setError(err.message);
      setPosts([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }

    return abortController;
  };

  // --- Fetch on mount (with cleanup) ---
  useEffect(() => {
    const abortController = new AbortController();

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts?_limit=10',
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        setError(err.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();

    // Cleanup: abort the request if component unmounts
    return () => {
      abortController.abort();
    };
  }, []); // 👈 Empty dependency array = run once on mount

  // --- Refresh handler ---
  const handleRefresh = () => {
    fetchPosts(true);
  };

  // --- Retry handler (on error) ---
  const handleRetry = () => {
    fetchPosts(false);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="post-fetcher">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-fetcher">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h3>Failed to load posts</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-fetcher">
      <header className="fetcher-header">
        <h1>📝 Posts</h1>
        <p>Fetched from JSONPlaceholder API</p>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </header>

      <div className="post-stats">
        <span>📊 Showing {posts.length} posts</span>
        <span className="stats-badge">✅ Loaded with useEffect</span>
      </div>

      <div className="post-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-number">#{post.id}</div>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-body">{post.body}</p>
            <div className="post-meta">
              <span className="post-user">👤 User {post.userId}</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="fetcher-footer">
        <p>
          💡 <strong>useEffect</strong> ran on mount with empty dependency array.
          <br />
          🧹 Cleanup with <code>AbortController</code> prevents memory leaks.
        </p>
      </footer>
    </div>
  );
}

export default PostFetcher;