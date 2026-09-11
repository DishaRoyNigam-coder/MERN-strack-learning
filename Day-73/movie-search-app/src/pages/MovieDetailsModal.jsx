// src/components/MovieDetailsModal.jsx

import { useEffect } from 'react';

function MovieDetailsModal({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const rating = movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating).toFixed(1) : 'N/A';
  const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Poster';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-end p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={poster}
                alt={movie.Title}
                className="w-full rounded-lg shadow-md"
              />
            </div>

            <div className="md:w-2/3 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {movie.Title} <span className="text-gray-500 dark:text-gray-400 text-xl font-normal">({movie.Year})</span>
              </h2>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                  ⭐ {rating}/10
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  🎭 {movie.Genre || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  ⏱️ {movie.Runtime || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  📅 {movie.Released || 'N/A'}
                </span>
              </div>

              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Plot:</strong> {movie.Plot || 'No plot available.'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-800 dark:text-gray-200">Cast:</strong> {movie.Actors || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-800 dark:text-gray-200">Director:</strong> {movie.Director || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-800 dark:text-gray-200">Rated:</strong> {movie.Rated || 'N/A'}
                </p>
              </div>

              {movie.imdbID && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdbID}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                >
                  🎬 View on IMDb
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsModal;