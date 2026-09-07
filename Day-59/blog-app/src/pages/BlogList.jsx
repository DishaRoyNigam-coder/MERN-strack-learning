// src/pages/BlogList.jsx

import { Link, useSearchParams } from 'react-router-dom';
import { posts } from '../data/posts';
import './BlogLayout.css';

function BlogList() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const filteredPosts = category === 'all'
    ? posts
    : posts.filter(p => p.category.toLowerCase() === category.toLowerCase());

  return (
    <div className="blog-list">
      <div className="blog-list-header">
        <h2>
          {category === 'all' ? 'All Posts' : `${category} Posts`}
          <span className="post-count">({filteredPosts.length})</span>
        </h2>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <p>No posts found in this category.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              <Link to={`/blog/post/${post.id}`} className="post-link">
                <div className="post-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-category">{post.category}</span>
                    <span className="post-date">{post.date}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-footer">
                    <span className="post-author">✍️ {post.author}</span>
                    <span className="post-read-more">Read More →</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogList;