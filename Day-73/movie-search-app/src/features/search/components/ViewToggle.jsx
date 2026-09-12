// src/features/search/components/ViewToggle.jsx

function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === 'pagination'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => viewMode !== 'pagination' && onToggle('pagination')}
        >
          📄 Pagination
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === 'infinite'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => viewMode !== 'infinite' && onToggle('infinite')}
        >
          ♾️ Infinite
        </button>
      </div>
    </div>
  );
}

export default ViewToggle;