// src/components/MovieCard.jsx

import { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { useMovieDetails } from '../hooks';
import MovieDetailsModal from './MovieDetailsModal';

function MovieCard({ movie, onMovieClick }) {
  const { isFavorite, toggleFavorite } = useSettingsContext();
  const { openDetails, closeDetails, movie: selectedMovie, isOpen, loading: detailsLoading } = useMovieDetails();
  const [imageError, setImageError] = useState(false);

  const poster = movie.Poster !== 'N/A' && !imageError
    ? movie.Poster
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  const handleClick = () => {
    onMovieClick?.(movie);
    openDetails(movie.imdbID);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(movie.imdbID);
  };

  const isFav = isFavorite(movie.imdbID);

  return (
    <>
      <div
        className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
        onClick={handleClick}
      >
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={movie.Title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={handleFavoriteClick}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-lg hover:scale-110 transition-transform"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {movie.Title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{movie.Year}</p>
        </div>
      </div>

      {/* Movie Details Modal */}
      {isOpen && selectedMovie && (
        <MovieDetailsModal movie={selectedMovie} onClose={closeDetails} />
      )}
      {detailsLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading movie details...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default MovieCard;