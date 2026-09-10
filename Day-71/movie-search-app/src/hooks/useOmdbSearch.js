// src/hooks/useOmdbSearch.js

import { useState, useEffect, useCallback } from 'react';
import useFetch from './useFetch';

const API_KEY = '3b7a80b4'; // Replace with your actual key
const API_BASE = 'https://www.omdbapi.com/';
const RESULTS_PER_PAGE = 10;

/**
 * A specialized hook for searching movies using the OMDB API.
 * Handles pagination and search state.
 */
function useOmdbSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allMovies, setAllMovies] = useState([]);

  // Build the search URL
  const buildUrl = useCallback((query, pageNum) => {
    if (!query.trim()) return null;
    return `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${pageNum}`;
  }, []);

  // Use the base useFetch hook
  const { data, loading, error, refetch, abort } = useFetch(
    buildUrl(searchQuery, page),
    {},
    false // Don't fetch on mount
  );

  // Reset state when search query changes
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setAllMovies([]);
    setTotalResults(0);
    setHasMore(true);
  }, [searchQuery]);

  // Fetch when searchQuery or page changes
  useEffect(() => {
    if (searchQuery.trim() && page > 0) {
      const url = buildUrl(searchQuery, page);
      if (url) {
        refetch(url);
      }
    }
  }, [searchQuery, page, refetch, buildUrl]);

  // Process the response
  useEffect(() => {
    if (data && data.Search) {
      const results = data.Search || [];
      const total = parseInt(data.totalResults) || 0;

      if (page === 1) {
        setMovies(results);
        setAllMovies(results);
      } else {
        setAllMovies(prev => [...prev, ...results]);
      }

      setTotalResults(total);
      setHasMore(page * RESULTS_PER_PAGE < total);
    } else if (data && data.Response === 'False') {
      // Error response from OMDB
      setMovies([]);
      setAllMovies([]);
      setTotalResults(0);
      setHasMore(false);
    }
  }, [data, page]);

  // Search function
  const search = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Go to next page
  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalResults]);

  // Go to specific page
  const goToPage = useCallback((pageNum) => {
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  }, [totalResults]);

  // Reset the search
  const reset = useCallback(() => {
    abort();
    setSearchQuery('');
    setPage(1);
    setMovies([]);
    setAllMovies([]);
    setTotalResults(0);
    setHasMore(true);
  }, [abort]);

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  return {
    // Data
    movies,
    allMovies,
    totalResults,
    totalPages,
    currentPage: page,
    hasMore,
    loading,
    error,

    // Actions
    search,
    nextPage,
    goToPage,
    reset,
    setPage,

    // Helpers
    isSearching: loading && page === 1,
    isLoadingMore: loading && page > 1,
    isEmpty: !loading && movies.length === 0 && searchQuery.trim() !== '',
    isIdle: !loading && movies.length === 0 && searchQuery.trim() === '',
  };
}

export default useOmdbSearch;