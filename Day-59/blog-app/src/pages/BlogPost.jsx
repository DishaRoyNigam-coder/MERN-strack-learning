// src/pages/BlogPost.jsx

import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById, getRelatedPosts } from '../data/posts';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = getPostById(id);

  // If post not found
  if (!post) {
    return (
      <div className="post-not-found">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        <Link to="/blog" className="back-link">← Back to Blog</Link>
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.id);

  return (
    <div className="blog-post">
      <div className="post-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="post-hero">
          <div className="post-hero-image">
            <img src={post.image} alt={post.title} loading="lazy" />
          </div>
          <div className="post-hero-content">
            <span className="post-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="post-author">✍️ {post.author}</span>
              <span className="post-date">📅 {post.date}</span>
            </div>
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="post-body">
        <div className="post-content-text">
          {post.content.split('\n\n').map((paragraph, index) => {
            // Check if it starts with ** (bold) or is a heading
            if (paragraph.startsWith('**')) {
              return (
                <div key={index} className="post-section-title">
                  {paragraph.replace(/\*\*/g, '')}
                </div>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={index} className="post-list">
                  {paragraph.split('\n').map((item, i) => (
                    <li key={i}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index} className="post-paragraph">{paragraph}</p>;
          })}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h3>Related Posts</h3>
          <div className="related-grid">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                to={`/blog/post/${related.id}`}
                className="related-card"
              >
                <div className="related-image">
                  <img src={related.image} alt={related.title} />
                </div>
                <h4>{related.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPost;