// src/pages/BlogPost.jsx (updated)

import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getPostById, getRelatedPosts } from '../data/posts';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const post = getPostById(id);

  // Get the previous page from location state
  const from = location.state?.from || '/blog';

  // If post not found
  if (!post) {
    return (
      <div className="post-not-found">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        <BackButton fallbackPath="/blog" label="← Back to Blog" />
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.id);

  // Handle custom back navigation
  const handleBack = () => {
    // If we have state, navigate to the previous page
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="blog-post">
      <div className="post-header">
        <div className="post-header-actions">
          <BackButton fallbackPath="/blog" label="← Back" />
          <button
            className="home-btn"
            onClick={() => navigate('/')}
            title="Go to Home"
          >
            🏠
          </button>
        </div>

        <Breadcrumb />

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
                state={{ from: location.pathname }}
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