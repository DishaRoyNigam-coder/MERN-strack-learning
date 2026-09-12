// src/features/search/components/SearchHistory.jsx

function SearchHistory({ history, onClear, onItemClick }) {
  if (history.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">🕒 Recent Searches</span>
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((term, index) => (
          <button
            key={index}
            onClick={() => onItemClick(term)}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchHistory;