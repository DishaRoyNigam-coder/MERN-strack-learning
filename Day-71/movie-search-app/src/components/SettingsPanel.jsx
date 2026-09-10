// src/components/SettingsPanel.jsx

import { useState } from 'react';
import { useSettings } from '../hooks';
import './SettingsPanel.css';

function SettingsPanel() {
  const {
    toggleTheme,
    isDark,
    viewMode,
    toggleViewMode,
    searchHistory,
    clearHistory,
    favorites,
    resetAll,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>⚙️ Settings</h3>
            <button className="settings-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="settings-body">
            {/* Theme */}
            <div className="setting-group">
              <label>Theme</label>
              <div className="setting-control">
                <button
                  className={`setting-btn ${!isDark ? 'active' : ''}`}
                  onClick={() => toggleTheme()}
                >
                  ☀️ Light
                </button>
                <button
                  className={`setting-btn ${isDark ? 'active' : ''}`}
                  onClick={() => toggleTheme()}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            {/* View Mode */}
            <div className="setting-group">
              <label>View Mode</label>
              <div className="setting-control">
                <button
                  className={`setting-btn ${viewMode === 'pagination' ? 'active' : ''}`}
                  onClick={() => toggleViewMode()}
                >
                  📄 Pagination
                </button>
                <button
                  className={`setting-btn ${viewMode === 'infinite' ? 'active' : ''}`}
                  onClick={() => toggleViewMode()}
                >
                  ♾️ Infinite
                </button>
              </div>
            </div>

            {/* Search History */}
            <div className="setting-group">
              <label>Search History</label>
              <div className="setting-info">
                <span>{searchHistory.length} items saved</span>
                {searchHistory.length > 0 && (
                  <button className="setting-action-btn" onClick={clearHistory}>
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {/* Favorites */}
            <div className="setting-group">
              <label>Favorites</label>
              <div className="setting-info">
                <span>❤️ {favorites.length} movies</span>
              </div>
            </div>

            {/* Reset */}
            <div className="setting-group">
              <label>Reset All</label>
              <button className="setting-reset-btn" onClick={resetAll}>
                🔄 Reset All Settings
              </button>
            </div>
          </div>

          <div className="settings-footer">
            <small>Settings are saved automatically to localStorage.</small>
          </div>
        </div>
      )}
    </>
  );
}

export default SettingsPanel;