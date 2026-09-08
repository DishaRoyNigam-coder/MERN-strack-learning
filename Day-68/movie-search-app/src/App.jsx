// src/App.jsx

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './App.css';

// ============================================================
// CONFIGURATION
// ============================================================

// 🔑 Replace with your OMDB API key
const API_KEY = '3b7a80b4';
const API_BASE = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 10;

// ============================================================
// CUSTOM HOOK: useDebounce
// ============================================================

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// CUSTOM HOOK: useLocalStorage
// ============================================================

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================

function App() {
  // --- State ---
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Infinite scroll state ---
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allMovies, setAllMovies] = useState([]);

  // --- Search history ---
  const [searchHistory, setSearchHistory] = useLocalStorage('movieSearchHistory', []);

  // --- Refs ---
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // --- Debounced query ---
  const debouncedQuery = useDebounce(query, 500);

  // --- Current mode: 'pagination' or 'infinite' ---
  const [viewMode, setViewMode] = useLocalStorage('movieViewMode', 'pagination');

  // --- Fetch movies ---
  const fetchMovies = useCallback(async (searchQuery, page = 1, append = false) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setTotalResults(0);
      setAllMovies([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!append) {
      setLoading(true);
      setError(null);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const url = `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}&page=${page}`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        throw new Error(data.Error || 'No results found.');
      }

      const results = data.Search || [];
      const total = parseInt(data.totalResults) || 0;

      if (append) {
        setAllMovies(prev => [...prev, ...results]);
        setHasMore(page * RESULTS_PER_PAGE < total);
      } else {
        setMovies(results);
        setAllMovies(results);
        setTotalResults(total);
        setCurrentPage(page);
        setHasMore(page * RESULTS_PER_PAGE < total);
      }

      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      if (append) {
        setHasMore(false);
      } else {
        setMovies([]);
        setAllMovies([]);
        setTotalResults(0);
      }
    } finally {
      if (!append) {
        setLoading(false);
      } else {
        setIsFetchingMore(false);
      }
    }
  }, []);

  // --- Initial search ---
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setCurrentPage(1);
      setAllMovies([]);
      fetchMovies(debouncedQuery, 1, false);
      // Add to search history
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== debouncedQuery);
        return [debouncedQuery, ...filtered].slice(0, 10);
      });
    } else {
      setMovies([]);
      setAllMovies([]);
      setTotalResults(0);
    }
  }, [debouncedQuery, fetchMovies, setSearchHistory]);

  // --- Pagination: Fetch next page ---
  const fetchNextPage = useCallback(() => {
    if (currentPage * RESULTS_PER_PAGE >= totalResults) return;
    const nextPage = currentPage + 1;
    fetchMovies(debouncedQuery, nextPage, false);
  }, [currentPage, totalResults, debouncedQuery, fetchMovies]);

  // --- Infinite scroll: Setup observer ---
  useEffect(() => {
    if (viewMode !== 'infinite') return;

    const currentRef = loadMoreRef.current;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading && debouncedQuery.trim()) {
          const nextPage = Math.ceil(allMovies.length / RESULTS_PER_PAGE) + 1;
          fetchMovies(debouncedQuery, nextPage, true);
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
  }, [viewMode, hasMore, isFetchingMore, loading, debouncedQuery, allMovies.length, fetchMovies]);

  // --- Fetch movie details ---
  const fetchMovieDetails = useCallback(async (imdbID) => {
    try {
      const url = `${API_BASE}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.Response === 'False') {
        throw new Error(data.Error || 'Movie not found.');
      }
      return data;
    } catch (err) {
      console.error('Error fetching details:', err);
      alert('Failed to load movie details. Please try again.');
      return null;
    }
  }, []);

  // --- Handlers ---
  const handleSearch = (e) => setQuery(e.target.value);

  const handleClearSearch = () => {
    setQuery('');
    setMovies([]);
    setAllMovies([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(totalResults / RESULTS_PER_PAGE)) return;
    fetchMovies(debouncedQuery, newPage, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovieClick = async (imdbID) => {
    const details = await fetchMovieDetails(imdbID);
    if (details) {
      setSelectedMovie(details);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  const handleHistoryClick = (searchTerm) => {
    setQuery(searchTerm);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'pagination' ? 'infinite' : 'pagination');
    setCurrentPage(1);
    setAllMovies([]);
    if (debouncedQuery.trim()) {
      fetchMovies(debouncedQuery, 1, false);
    }
  };

  // --- Auto-focus on mount ---
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // --- Display movies based on view mode ---
  const displayMovies = viewMode === 'pagination' ? movies : allMovies;
  const displayLoading = viewMode === 'pagination' ? loading : loading && allMovies.length === 0;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Movie Search</h1>
        <p>Search for your favorite movies</p>
        <div className="view-toggle">
          <span>View Mode:</span>
          <button
            className={`toggle-btn ${viewMode === 'pagination' ? 'active' : ''}`}
            onClick={() => viewMode !== 'pagination' && toggleViewMode()}
          >
            📄 Pagination
          </button>
          <button
            className={`toggle-btn ${viewMode === 'infinite' ? 'active' : ''}`}
            onClick={() => viewMode !== 'infinite' && toggleViewMode()}
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
        {loading && <span className="loading-spinner">⏳</span>}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !loading && !debouncedQuery && (
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
              onClick={() => handleMovieClick(movie.imdbID)}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Load More Trigger */}
      {viewMode === 'infinite' && !error && displayMovies.length > 0 && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isFetchingMore && <span className="load-more-spinner">⏳ Loading more...</span>}
          {!hasMore && !isFetchingMore && displayMovies.length > 0 && (
            <span className="load-more-end">🎬 All movies loaded</span>
          )}
        </div>
      )}

      {/* Pagination */}
      {viewMode === 'pagination' && !loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Empty State */}
      {!displayLoading && !error && debouncedQuery && displayMovies.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No movies found</h3>
          <p>Try a different search term.</p>
        </div>
      )}

      {!displayLoading && !error && !debouncedQuery && (
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
        <MovieDetails movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}

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

export default App;