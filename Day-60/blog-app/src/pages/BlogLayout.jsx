// src/pages/BlogLayout.jsx (updated)

import { Outlet, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import './BlogLayout.css';

function BlogLayout() {
  return (
    <div className="blog-layout">
      <header className="blog-header">
        <div className="blog-header-content">
          <Link to="/blog" className="blog-home-link">
            <h1>📝 Blog</h1>
          </Link>
          <p>Stories, tutorials, and insights</p>
        </div>
        <div className="blog-header-actions">
          <Link to="/" className="home-link">🏠 Home</Link>
        </div>
      </header>

      <div className="blog-container">
        <div className="blog-main-wrapper">
          <Breadcrumb />
          <main className="blog-main">
            <Outlet />
          </main>
        </div>
      </div>

      <footer className="blog-footer">
        <p>© 2026 Blog. Built with React Router v6.</p>
      </footer>
    </div>
  );
}

export default BlogLayout;