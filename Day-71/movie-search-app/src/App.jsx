// src/App.jsx (Updated with Error Boundaries)

import { useState, useEffect, useRef } from 'react';
import { useOmdbSearch, useMovieDetails, useSettings } from './hooks';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPanel from './components/SettingsPanel';
import BuggyComponent from './components/BuggyComponent';
import './App.css';

// ... (MovieCard, Pagination, BackToTop, MovieDetails components remain the same) ...

function App() {
  const {
    movies,
    allMovies,
    totalResults,
    totalPages,
    currentPage,
    hasMore,
    loading,
    error,
    search,
    nextPage,
    goToPage,
    reset: resetSearch,
    isSearching,
    isLoadingMore,
    isEmpty,
    isIdle,
  } = useOmdbSearch();

  const {
    movie: selectedMovie,
    loading: detailsLoading,
    isOpen: showModal,
    openDetails,
    closeDetails,
  } = useMovieDetails();

  const {
    theme,
    toggleTheme,
    isDark,
    viewMode,
    toggleViewMode,
      searchHistory,
    addSearchHistory,
     clearHistory, 
    favorites,
    toggleFavorite,
    isFavorite,
  } = useSettings();

  const [query, setQuery] = useState('');
  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // --- Handlers ---
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    search(value);
    if (value.trim()) addSearchHistory(value);
  };

  const handleClearSearch = () => {
    setQuery('');
    resetSearch();
    searchInputRef.current?.focus();
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    search(term);
  };

  // --- Error logging (called by ErrorBoundary) ---
  const logError = (error, errorInfo) => {
    console.log('📤 Sending error to analytics:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  // --- Apply theme ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'dark' ? '#0f172a' : '#f1f5f9';
    document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#0f172a';
  }, [theme]);

  // --- Infinite Scroll ---
  useEffect(() => {
    if (viewMode !== 'infinite') return;

    const currentRef = loadMoreRef.current;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading && query.trim()) {
          nextPage();
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    );

    if (currentRef) observerRef.current.observe(currentRef);

    return () => observerRef.current?.disconnect();
  }, [viewMode, hasMore, isLoadingMore, loading, query, nextPage]);

  // --- Auto-focus ---
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const displayMovies = viewMode === 'pagination' ? movies : allMovies;
  const displayLoading = viewMode === 'pagination' ? isSearching : loading && allMovies.length === 0;

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <div className="header-left">
          <h1>🎬 Movie Search</h1>
          <p>Search for your favorite movies</p>
        </div>
        <div className="header-right">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <div className="view-toggle">
            <span>View:</span>
            <button
              className={`toggle-btn ${viewMode === 'pagination' ? 'active' : ''}`}
              onClick={() => viewMode !== 'pagination' && toggleViewMode()}
            >
              📄
            </button>
            <button
              className={`toggle-btn ${viewMode === 'infinite' ? 'active' : ''}`}
              onClick={() => viewMode !== 'infinite' && toggleViewMode()}
            >
              ♾️
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          ERROR BOUNDARY: Search Bar & History
          ============================================================ */}
      <ErrorBoundary name="SearchSection" onError={logError}>
        <div className="search-container">
          <div className="search-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search for movies (e.g., Inception, Matrix)..."
              value={query}
              onChange={handleSearch}
              aria-label="Search movies"
            />
            {query && (
              <button className="clear-btn" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
          {isSearching && <span className="loading-spinner">⏳</span>}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !isSearching && !query && (
          <div className="search-history">
            <div className="history-header">
              <span>🕒 Recent Searches</span>
              <button className="clear-history-btn" onClick={() => clearHistory()}>
                Clear All
              </button>
            </div>
            <div className="history-tags">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  className="history-tag"
                  onClick={() => handleHistoryClick(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </ErrorBoundary>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Results Info */}
      {!displayLoading && !error && displayMovies.length > 0 && (
        <div className="results-info">
          <span>🎯 Found {totalResults} results</span>
          {viewMode === 'pagination' && (
            <span>📄 Page {currentPage} of {totalPages}</span>
          )}
          {viewMode === 'infinite' && (
            <span>📄 Showing {displayMovies.length} of {totalResults}</span>
          )}
        </div>
      )}

      {/* ============================================================
          ERROR BOUNDARY: Movie Grid
          ============================================================ */}
      <ErrorBoundary name="MovieGrid" fallback={
        <div className="movie-grid-error">
          <p>⚠️ Some movies couldn't be loaded.</p>
          <button onClick={() => window.location.reload()}>🔄 Reload</button>
        </div>
      }>
        {!displayLoading && !error && displayMovies.length > 0 && (
          <div className="movie-grid">
            {displayMovies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={() => openDetails(movie.imdbID)}
              />
            ))}
          </div>
        )}
      </ErrorBoundary>

      {/* ============================================================
          ERROR BOUNDARY: Buggy Component (Test)
          ============================================================ */}
      <div className="buggy-section">
        <ErrorBoundary name="BuggyComponent" onError={logError}>
          <BuggyComponent />
        </ErrorBoundary>
      </div>

      {/* Infinite Scroll Trigger */}
      {viewMode === 'infinite' && !error && displayMovies.length > 0 && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isLoadingMore && <span className="load-more-spinner">⏳ Loading more...</span>}
          {!hasMore && !isLoadingMore && displayMovies.length > 0 && (
            <span className="load-more-end">🎬 All movies loaded</span>
          )}
        </div>
      )}

      {/* Pagination */}
      {viewMode === 'pagination' && !isSearching && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}

      {/* Empty State */}
      {!displayLoading && !error && !isEmpty && !isIdle && displayMovies.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No movies found</h3>
          <p>Try a different search term.</p>
        </div>
      )}

      {isIdle && (
        <div className="empty-state">
          <span className="empty-icon">🎬</span>
          <h3>Start searching</h3>
          <p>Type a movie title in the search box above.</p>
        </div>
      )}

      {/* Back to Top */}
      {displayMovies.length > 0 && <BackToTop />}

      {/* Settings Panel */}
      <SettingsPanel />

      {/* Movie Details Modal */}
      {showModal && selectedMovie && (
        <MovieDetails movie={selectedMovie} onClose={closeDetails} />
      )}

      {detailsLoading && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <p>⏳ Loading movie details...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;