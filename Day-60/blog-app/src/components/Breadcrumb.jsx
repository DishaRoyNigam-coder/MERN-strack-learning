// src/components/Breadcrumb.jsx

import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  // If we're on the home page, don't show breadcrumbs
  if (pathnames.length === 0) {
    return null;
  }

  // Build the breadcrumb trail
  const crumbs = pathnames.map((pathname, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;

    // Capitalize and replace hyphens with spaces
    const label = pathname
      .replace(/-/g, ' ')
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    return {
      label,
      routeTo,
      isLast
    };
  });

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">Home</Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            {crumb.isLast ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.routeTo} className="breadcrumb-link">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;