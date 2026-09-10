// src/hooks/useFetch.js

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook for fetching data with loading and error states.
 * Supports aborting requests and caching (optional).
 *
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @returns {object} { data, loading, error, refetch, abort }
 */
function useFetch(url, options = {}, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Store the abort controller
  const abortControllerRef = useRef(null);

  // Fetch function
  const fetchData = useCallback(async (customUrl = null, customOptions = null) => {
    const fetchUrl = customUrl || url;
    const fetchOptions = customOptions || options;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON
      const result = await response.json();

      // Check if the response indicates an error
      if (result.Response === 'False') {
        throw new Error(result.Error || 'Request failed.');
      }

      if (isMounted.current) {
        setData(result);
        setError(null);
        return result;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was aborted, ignore
        return null;
      }
      if (isMounted.current) {
        setError(err.message);
        setData(null);
      }
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [url, options]);

  // Abort function
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Fetch on mount if immediate is true
  useEffect(() => {
    isMounted.current = true;

    if (immediate && url) {
      fetchData();
    }

    // Cleanup: abort on unmount
    return () => {
      isMounted.current = false;
      abort();
    };
  }, [fetchData, abort, immediate, url]);

  // Refetch function (exposed to the user)
  const refetch = useCallback((newUrl = null, newOptions = null) => {
    return fetchData(newUrl || url, newOptions || options);
  }, [fetchData, url, options]);

  return {
    data,
    loading,
    error,
    refetch,
    abort,
    // Additional helpers
    isSuccess: data !== null && !error && !loading,
    isError: error !== null,
    isIdle: data === null && !loading && !error,
  };
}

export default useFetch;