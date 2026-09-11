// src/hooks/useLocalStorage.js

import { useState, useCallback, useEffect } from 'react';

/**
 * useLocalStorage
 *
 * A hook that syncs state with localStorage.
 *
 * @param {string} key - The localStorage key to store the value under.
 * @param {*} initialValue - The initial value if nothing is stored.
 * @returns {[*, function, function]} - [storedValue, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * setTheme('dark'); // Updates state and localStorage
 * removeTheme(); // Removes from localStorage, resets to initial value
 */
function useLocalStorage(key, initialValue) {
  // --- Validation ---
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('useLocalStorage: key must be a non-empty string');
  }

  // --- Lazy initialization: read from localStorage ---
  const readStoredValue = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        // Parse the stored JSON
        return JSON.parse(item);
      }
      // Return initial value if nothing is stored
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  // --- State ---
  const [storedValue, setStoredValue] = useState(readStoredValue);

  // --- Set value ---
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function (like useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Update state
      setStoredValue(valueToStore);

      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));

      // Dispatch a custom event so other tabs can sync
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore),
        storageArea: localStorage,
      }));

    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // --- Remove value ---
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // --- Sync with other tabs ---
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = JSON.parse(event.newValue);
          setStoredValue(newValue);
        } catch {
          // If it's not valid JSON, use the raw string
          setStoredValue(event.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  // --- Sync with other hooks using the same key ---
  // This allows multiple components to use the same key and stay in sync
  useEffect(() => {
    const handleCustomEvent = () => {
      const newValue = readStoredValue();
      setStoredValue(newValue);
    };

    // Custom event for same-tab communication
    window.addEventListener(`localStorage-${key}`, handleCustomEvent);

    return () => {
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent);
    };
  }, [key, readStoredValue]);

  // --- Expose a way to manually sync ---
  const sync = useCallback(() => {
    const newValue = readStoredValue();
    setStoredValue(newValue);
  }, [readStoredValue]);

  return [storedValue, setValue, removeValue, sync];
}

export default useLocalStorage;