// src/App.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// ============================================================
// CONFIGURATION
// ============================================================

// 🔑 Replace with your OMDB API key
const API_KEY = '3b7a80b4';
const API_BASE = 'https://www.omdbapi.com/';

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
  const [selectedMovie, setSelectedMovie] = useState(null); // for details modal
  const [showModal, setShowModal] = useState(false);

  // --- Refs ---
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // --- Fetch movies ---
  const fetchMovies = useCallback(async (searchQuery, page = 1) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setTotalResults(0);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

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

      setMovies(data.Search || []);
      setTotalResults(parseInt(data.totalResults) || 0);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      setError(err.message);
      setMovies([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch movie details by ID ---
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

  // --- Debounced search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchMovies(query, 1);
      } else {
        setMovies([]);
        setTotalResults(0);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, fetchMovies]);

  // --- Handlers ---
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(totalResults / 10)) return;
    fetchMovies(query, newPage);
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

  // --- Auto-focus on mount ---
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // --- Render helpers ---
  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Movie Search</h1>
        <p>Search for your favorite movies</p>
      </header>

      {/* Search Bar */}
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search for movies (e.g., Inception, Matrix)..."
          value={query}
          onChange={handleSearch}
          aria-label="Search movies"
        />
        {loading && <span className="loading-spinner">⏳</span>}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Results Info */}
      {!loading && !error && movies.length > 0 && (
        <div className="results-info">
          <span>🎯 Found {totalResults} results</span>
          <span>📄 Page {currentPage} of {totalPages}</span>
        </div>
      )}

      {/* Movie Grid */}
      {!loading && !error && movies.length > 0 && (
        <>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={() => handleMovieClick(movie.imdbID)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && query.trim() && movies.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No movies found</h3>
          <p>Try a different search term.</p>
        </div>
      )}

      {!loading && !error && !query.trim() && (
        <div className="empty-state">
          <span className="empty-icon">🎬</span>
          <h3>Start searching</h3>
          <p>Type a movie title in the search box above.</p>
        </div>
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
        <span className="movie-id">{movie.imdbID}</span>
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
      {pages.map((page) => (
        <button
          key={page}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
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
// MOVIE DETAILS MODAL COMPONENT
// ============================================================

function MovieDetails({ movie, onClose }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close modal on backdrop click
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