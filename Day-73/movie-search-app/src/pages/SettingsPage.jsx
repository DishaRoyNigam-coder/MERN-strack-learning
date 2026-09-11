// src/pages/SettingsPage.jsx

import { useSettings } from '../hooks';
import './SettingsPage.css';

function SettingsPage() {
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

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your app experience</p>
      </header>

      <div className="settings-page-body">
        {/* Theme */}
        <div className="setting-card">
          <div className="setting-card-header">
            <span className="setting-icon">🎨</span>
            <div>
              <h3>Theme</h3>
              <p>Choose your preferred color scheme</p>
            </div>
          </div>
          <div className="setting-card-control">
            <button
              className={`theme-option ${!isDark ? 'active' : ''}`}
              onClick={toggleTheme}
            >
              ☀️ Light
            </button>
            <button
              className={`theme-option ${isDark ? 'active' : ''}`}
              onClick={toggleTheme}
            >
              🌙 Dark
            </button>
            <span className="theme-current">{isDark ? 'Dark' : 'Light'} mode active</span>
          </div>
        </div>

        {/* View Mode */}
        <div className="setting-card">
          <div className="setting-card-header">
            <span className="setting-icon">📄</span>
            <div>
              <h3>View Mode</h3>
              <p>How results are displayed</p>
            </div>
          </div>
          <div className="setting-card-control">
            <button
              className={`view-option ${viewMode === 'pagination' ? 'active' : ''}`}
              onClick={toggleViewMode}
            >
              📄 Pagination
            </button>
            <button
              className={`view-option ${viewMode === 'infinite' ? 'active' : ''}`}
              onClick={toggleViewMode}
            >
              ♾️ Infinite Scroll
            </button>
            <span className="view-current">{viewMode === 'pagination' ? 'Pagination' : 'Infinite Scroll'} active</span>
          </div>
        </div>

        {/* Search History */}
        <div className="setting-card">
          <div className="setting-card-header">
            <span className="setting-icon">🕒</span>
            <div>
              <h3>Search History</h3>
              <p>{searchHistory.length} saved searches</p>
            </div>
          </div>
          <div className="setting-card-control">
            {searchHistory.length > 0 ? (
              <>
                <div className="history-list">
                  {searchHistory.map((term, index) => (
                    <span key={index} className="history-term">{term}</span>
                  ))}
                </div>
                <button className="danger-btn" onClick={clearHistory}>
                  🗑️ Clear All
                </button>
              </>
            ) : (
              <p className="empty-hint">No search history yet.</p>
            )}
          </div>
        </div>

        {/* Favorites */}
        <div className="setting-card">
          <div className="setting-card-header">
            <span className="setting-icon">❤️</span>
            <div>
              <h3>Favorites</h3>
              <p>{favorites.length} saved movies</p>
            </div>
          </div>
          <div className="setting-card-control">
            <p className="favorites-hint">
              {favorites.length > 0
                ? `You have ${favorites.length} favorite movie(s).`
                : 'No favorites yet. Start adding some!'}
            </p>
          </div>
        </div>

        {/* Reset All */}
        <div className="setting-card danger-card">
          <div className="setting-card-header">
            <span className="setting-icon">⚠️</span>
            <div>
              <h3>Reset All Settings</h3>
              <p>This will reset all preferences to default</p>
            </div>
          </div>
          <div className="setting-card-control">
            <button className="reset-btn" onClick={resetAll}>
              🔄 Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;