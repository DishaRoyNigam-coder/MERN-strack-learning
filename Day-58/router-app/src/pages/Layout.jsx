// src/components/Layout.jsx

import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">MyApp</span>
        </div>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            end
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            📖 About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            📬 Contact
          </NavLink>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>© 2026 MyApp. Built with React Router v6.</p>
        <p className="footer-links">
          <NavLink to="/">Home</NavLink> ·{' '}
          <NavLink to="/about">About</NavLink> ·{' '}
          <NavLink to="/contact">Contact</NavLink>
        </p>
      </footer>
    </div>
  );
}

export default Layout;