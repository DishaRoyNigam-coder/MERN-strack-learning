// src/pages/SearchPage.jsx (Tailwind)

import { useState, useEffect, useRef } from 'react';
import { useOmdbSearch, useMovieDetails, useSettingsContext } from '../hooks';
import MovieCard from "../pages/MovieCard";
function SearchPage() {
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

  const { openDetails } = useMovieDetails();

  const { viewMode, toggleViewMode, addSearchHistory, clearHistory, searchHistory } = useSettingsContext();

  const [query, setQuery] = useState('');
  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

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

  // Infinite Scroll
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

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const displayMovies = viewMode === 'pagination' ? movies : allMovies;
  const displayLoading = viewMode === 'pagination' ? isSearching : loading && allMovies.length === 0;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Search for movies (e.g., Inception, Matrix)..."
            value={query}
            onChange={handleSearch}
          />
          {query && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
        {isSearching && (
          <div className="flex items-center px-4 text-gray-500 dark:text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !isSearching && !query && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">🕒 Recent Searches</span>
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(term)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'pagination'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => viewMode !== 'pagination' && toggleViewMode()}
          >
            📄 Pagination
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'infinite'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => viewMode !== 'infinite' && toggleViewMode()}
          >
            ♾️ Infinite
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Results Info */}
      {!displayLoading && !error && displayMovies.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayMovies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} onMovieClick={openDetails} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {viewMode === 'infinite' && !error && displayMovies.length > 0 && (
        <div ref={loadMoreRef} className="text-center py-4 text-gray-500 dark:text-gray-400">
          {isLoadingMore && (
            <span className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              Loading more...
            </span>
          )}
          {!hasMore && !isLoadingMore && displayMovies.length > 0 && (
            <span>🎬 All movies loaded</span>
          )}
        </div>
      )}

      {/* Pagination */}
      {viewMode === 'pagination' && !isSearching && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ◀ Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2);
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg border ${
                  page === currentPage
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Empty State */}
      {!displayLoading && !error && !isEmpty && !isIdle && displayMovies.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <span className="text-6xl block mb-4">🔍</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No movies found</h3>
          <p className="mt-2">Try a different search term.</p>
        </div>
      )}

      {isIdle && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <span className="text-6xl block mb-4">🎬</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Start searching</h3>
          <p className="mt-2">Type a movie title in the search box above.</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;