// src/pages/BlogList.jsx (updated)

import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { posts } from '../data/posts';
import './BlogList.css';

function BlogList() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from query strings
  const category = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Filter and sort posts
  let filteredPosts = posts;

  // Filter by category
  if (category !== 'all') {
    filteredPosts = filteredPosts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.excerpt.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.author.toLowerCase().includes(query)
    );
  }

  // Sort posts
  switch (sort) {
    case 'oldest':
      filteredPosts = [...filteredPosts].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );
      break;
    case 'newest':
    default:
      filteredPosts = [...filteredPosts].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );
      break;
  }

  // Get unique categories for the filter dropdown
  const categories = ['all', ...new Set(posts.map(p => p.category))];

  // Update filters
  const updateFilter = (key, value) => {
    if (value === 'all' || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Check if any filters are active
  const hasFilters = category !== 'all' || searchQuery || sort !== 'newest';

  return (
    <div className="blog-list">
      <div className="blog-list-header">
        <h2>
          {category === 'all' ? 'All Posts' : `${category} Posts`}
          <span className="post-count">({filteredPosts.length})</span>
        </h2>
        <div className="filter-info">
          {hasFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchInput">Search:</label>
          <input
            type="text"
            id="searchInput"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => updateFilter('q', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sortSelect">Sort:</label>
          <select
            id="sortSelect"
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      {hasFilters && (
        <div className="filter-summary">
          <span>Active filters:</span>
          {category !== 'all' && (
            <span className="filter-tag">
              Category: {category}
              <button
                className="filter-tag-remove"
                onClick={() => updateFilter('category', 'all')}
              >
                ✕
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="filter-tag">
              Search: "{searchQuery}"
              <button
                className="filter-tag-remove"
                onClick={() => updateFilter('q', '')}
              >
                ✕
              </button>
            </span>
          )}
          {sort !== 'newest' && (
            <span className="filter-tag">
              Sort: {sort === 'oldest' ? 'Oldest First' : sort}
              <button
                className="filter-tag-remove"
                onClick={() => updateFilter('sort', 'newest')}
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <span className="no-posts-icon">🔍</span>
          <p>No posts found matching your filters.</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <article key={post.id} className="post-card">
              <Link
                to={`/blog/post/${post.id}`}
                className="post-link"
                state={{ from: location.pathname + location.search }}
              >
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