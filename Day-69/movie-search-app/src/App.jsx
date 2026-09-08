// src/App.jsx (Refactored with Custom Hooks)

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useOmdbSearch,
  useMovieDetails,
  useLocalStorage,
} from './hooks';
import './App.css';

// ============================================================
// MOVIE CARD COMPONENT
// ============================================================

function MovieCard({ movie, onClick }) {
  const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-card" onClick={onClick}>
      <img src={poster} alt={movie.Title} className="movie-poster" loading="lazy" />
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        <p className="movie-year">{movie.Year}</p>
      </div>
    </div>
  );
}

// ============================================================
// PAGINATION COMPONENT
// ============================================================

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ◀ Prev
      </button>
      {start > 1 && <span className="page-ellipsis">…</span>}
      {pages.map((page) => (
        <button
          key={page}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {end < totalPages && <span className="page-ellipsis">…</span>}
      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next ▶
      </button>
    </div>
  );
}

// ============================================================
// BACK TO TOP COMPONENT
// ============================================================

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

// ============================================================
// MOVIE DETAILS MODAL COMPONENT
// ============================================================

function MovieDetails({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const rating = movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating).toFixed(1) : 'N/A';
  const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Poster';

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <img src={poster} alt={movie.Title} className="modal-poster" />
          <div className="modal-info">
            <h2>{movie.Title} ({movie.Year})</h2>
            <p className="modal-meta">
              <span>⭐ {rating}/10</span>
              <span>🎭 {movie.Genre || 'N/A'}</span>
              <span>⏱️ {movie.Runtime || 'N/A'}</span>
              <span>📅 {movie.Released || 'N/A'}</span>
            </p>
            <p className="modal-plot"><strong>Plot:</strong> {movie.Plot || 'No plot available.'}</p>
            <p className="modal-cast"><strong>Cast:</strong> {movie.Actors || 'N/A'}</p>
            <p className="modal-director"><strong>Director:</strong> {movie.Director || 'N/A'}</p>
            <p className="modal-rated"><strong>Rated:</strong> {movie.Rated || 'N/A'}</p>
            {movie.imdbID && (
              <a
                href={`https://www.imdb.com/title/${movie.imdbID}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="imdb-link"
              >
                🎬 View on IMDb
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT (REFACTORED)
// ============================================================

function App() {
  // ---- Custom Hooks ----
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

  const [viewMode, setViewMode] = useLocalStorage('movieViewMode', 'pagination');

  // ---- Local State ----
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useLocalStorage('movieSearchHistory', []);

  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // ---- Handlers ----
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    search(value);
  };

  const handleClearSearch = () => {
    setQuery('');
    resetSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    search(term);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'pagination' ? 'infinite' : 'pagination');
  };

  // ---- Add to search history ----
  useEffect(() => {
    if (query.trim() && movies.length > 0) {
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== query);
        return [query, ...filtered].slice(0, 10);
      });
    }
  }, [query, movies, setSearchHistory]);

  // ---- Infinite Scroll: Setup observer ----
  useEffect(() => {
    if (viewMode !== 'infinite') return;

    const currentRef = loadMoreRef.current;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading && query.trim()) {
          nextPage();
        }
      },
      { threshold: 0.5, rootMargin: '200px' }
    );

    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [viewMode, hasMore, isLoadingMore, loading, query, nextPage]);

  // ---- Auto-focus on mount ----
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // ---- Display movies based on view mode ----
  const displayMovies = viewMode === 'pagination' ? movies : allMovies;
  const displayLoading = viewMode === 'pagination' ? isSearching : loading && allMovies.length === 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Movie Search</h1>
        <p>Search for your favorite movies</p>
        <div className="view-toggle">
          <span>View Mode:</span>
          <button
            className={`toggle-btn ${viewMode === 'pagination' ? 'active' : ''}`}
            onClick={toggleViewMode}
          >
            📄 Pagination
          </button>
          <button
            className={`toggle-btn ${viewMode === 'infinite' ? 'active' : ''}`}
            onClick={toggleViewMode}
          >
            ♾️ Infinite Scroll
          </button>
        </div>
      </header>

      {/* Search Bar */}
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
            <button className="clear-history-btn" onClick={handleClearHistory}>
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

      {/* Movie Grid */}
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

      {/* Infinite Scroll Load More Trigger */}
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

      {/* Back to Top Button */}
      {displayMovies.length > 0 && (
        <BackToTop />
      )}

      {/* Movie Details Modal */}
      {showModal && selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={closeDetails}
        />
      )}

      {/* Loading overlay for details */}
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