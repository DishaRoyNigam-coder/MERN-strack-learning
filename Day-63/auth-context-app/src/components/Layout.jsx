// src/components/Layout.jsx

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <span className="brand-icon">🔐</span>
          <span className="brand-name">Auth Demo</span>
        </div>

        <nav className="layout-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            end
          >
            Home
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="layout-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">👤 {user?.name}</span>
              <button className="logout-link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="login-link">
              Sign In
            </NavLink>
          )}
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <p>© 2026 Auth Demo. Built with React Context API.</p>
      </footer>
    </div>
  );
}

export default Layout;