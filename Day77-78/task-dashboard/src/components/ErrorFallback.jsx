// src/components/ErrorFallback.jsx

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-75 p-6 text-center">
      <span className="text-6xl mb-4">⚠️</span>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
        {error?.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}