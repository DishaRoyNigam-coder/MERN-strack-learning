// src/features/search/components/SearchBar.jsx

import { forwardRef } from 'react';

const SearchBar = forwardRef(({ value, onChange, onClear, isLoading, placeholder }, ref) => {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <input
          ref={ref}
          type="text"
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder={placeholder || "Search for movies..."}
          value={value}
          onChange={onChange}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {isLoading && (
        <div className="flex items-center px-4 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;