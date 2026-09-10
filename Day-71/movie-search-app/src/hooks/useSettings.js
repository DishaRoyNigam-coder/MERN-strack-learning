// src/hooks/useSettings.js

import useLocalStorage from './useLocalStorage';

/**
 * useSettings
 *
 * A hook that manages all user settings using useLocalStorage.
 * Centralizes settings management in one place.
 */
function useSettings() {
  // Theme mode: 'light' or 'dark'
  const [theme, setTheme] = useLocalStorage('movieTheme', 'dark');

  // View mode: 'pagination' or 'infinite'
  const [viewMode, setViewMode] = useLocalStorage('movieViewMode', 'pagination');

  // Search history
  const [searchHistory, setSearchHistory, clearSearchHistory] = useLocalStorage('movieSearchHistory', []);

  // Favorite movies
  const [favorites, setFavorites, clearFavorites] = useLocalStorage('movieFavorites', []);

  // Preferred language (for future use)
  const [language, setLanguage] = useLocalStorage('movieLanguage', 'en');

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'pagination' ? 'infinite' : 'pagination');
  };

  // Add a movie to favorites
  const addFavorite = (movieId) => {
    if (!favorites.includes(movieId)) {
      setFavorites([...favorites, movieId]);
    }
  };

  // Remove a movie from favorites
  const removeFavorite = (movieId) => {
    setFavorites(favorites.filter(id => id !== movieId));
  };

  // Check if a movie is favorited
  const isFavorite = (movieId) => favorites.includes(movieId);

  // Toggle favorite
  const toggleFavorite = (movieId) => {
    if (isFavorite(movieId)) {
      removeFavorite(movieId);
    } else {
      addFavorite(movieId);
    }
  };

  // Add a search term to history
  const addSearchHistory = (term) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== term);
      return [term, ...filtered].slice(0, 10);
    });
  };

  // Clear all search history
  const clearHistory = () => {
    clearSearchHistory();
  };

  return {
    // Theme
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',

    // View Mode
    viewMode,
    setViewMode,
    toggleViewMode,
    isPagination: viewMode === 'pagination',
    isInfinite: viewMode === 'infinite',

    // Search History
    searchHistory,
    addSearchHistory,
    clearHistory,

    // Favorites
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,

    // Language
    language,
    setLanguage,

    // Reset all settings
    resetAll: () => {
      setTheme('dark');
      setViewMode('pagination');
      clearSearchHistory();
      clearFavorites();
    },
  };
}

export default useSettings;