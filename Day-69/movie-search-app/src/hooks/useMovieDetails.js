// src/hooks/useMovieDetails.js

import { useState, useCallback } from 'react';
import useFetch from './useFetch';

const API_KEY = 'YOUR_API_KEY'; // Replace with your actual key
const API_BASE = 'https://www.omdbapi.com/';

/**
 * A hook for fetching movie details by IMDb ID.
 */
function useMovieDetails() {
  const [movieId, setMovieId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const buildUrl = useCallback((id) => {
    if (!id) return null;
    return `${API_BASE}?apikey=${API_KEY}&i=${id}&plot=full`;
  }, []);

  const { data, loading, error, refetch, reset } = useFetch(
    buildUrl(movieId),
    {},
    false // Don't fetch on mount
  );

  // Open details for a movie
  const openDetails = useCallback((id) => {
    setMovieId(id);
    setIsOpen(true);
    refetch(buildUrl(id));
  }, [refetch, buildUrl]);

  // Close details
  const closeDetails = useCallback(() => {
    setIsOpen(false);
    setMovieId(null);
    reset();
  }, [reset]);

  return {
    movie: data,
    loading,
    error,
    isOpen,
    openDetails,
    closeDetails,
  };
}

export default useMovieDetails;