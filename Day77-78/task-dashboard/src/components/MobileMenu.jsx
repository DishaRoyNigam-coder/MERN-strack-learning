// src/components/MobileMenu.jsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTasks, FaUsers, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

export function MobileMenu({ logout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="sm:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaHome size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaTasks size={18} />
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaUsers size={18} />
            <span>Team</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaCog size={18} />
            <span>Settings</span>
          </NavLink>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}