// src/pages/BlogLayout.jsx

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './BlogLayout.css';

function BlogLayout() {
  const navigate = useNavigate();

  return (
    <div className="blog-layout">
      <header className="blog-header">
        <div className="blog-header-content">
          <h1>📝 Blog</h1>
          <p>Stories, tutorials, and insights</p>
        </div>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </header>

      <div className="blog-container">
        <aside className="blog-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul className="category-list">
              <li><NavLink to="/blog?category=all">All Posts</NavLink></li>
              <li><NavLink to="/blog?category=react">React</NavLink></li>
              <li><NavLink to="/blog?category=javascript">JavaScript</NavLink></li>
              <li><NavLink to="/blog?category=css">CSS</NavLink></li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Recent Posts</h3>
            <ul className="recent-list">
              {/* Recent posts will be rendered here */}
            </ul>
          </div>
        </aside>

        <main className="blog-main">
          <Outlet /> {/* Child routes (BlogList or BlogPost) render here */}
        </main>
      </div>

      <footer className="blog-footer">
        <p>© 2026 Blog. Built with React Router v6.</p>
      </footer>
    </div>
  );
}

export default BlogLayout;