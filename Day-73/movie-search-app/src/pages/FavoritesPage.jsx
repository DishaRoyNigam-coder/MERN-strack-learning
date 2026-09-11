// src/pages/FavoritesPage.jsx

import { useSettings, useMovieDetails } from '../hooks';
import MovieCard from '../pages/MovieCard';
import MovieDetails from '../pages/MovieDetailsModal';
import './FavoritesPage.css';

// Mock favorite movies data (in a real app, you'd fetch these by ID)
const mockFavorites = [
  { imdbID: 'tt1375666', Title: 'Inception', Year: '2010', Poster: 'https://via.placeholder.com/300x450?text=Inception' },
  { imdbID: 'tt0133093', Title: 'The Matrix', Year: '1999', Poster: 'https://via.placeholder.com/300x450?text=Matrix' },
  { imdbID: 'tt0468569', Title: 'The Dark Knight', Year: '2008', Poster: 'https://via.placeholder.com/300x450?text=Dark+Knight' },
];

function FavoritesPage() {
  const { favorites } = useSettings();
  const { movie: selectedMovie, isOpen: showModal, openDetails, closeDetails } = useMovieDetails();

  // In a real app, you'd fetch the full movie data for each favorite ID
  // For now, we'll use mock data
  const favoriteMovies = favorites.length > 0 ? mockFavorites.slice(0, favorites.length) : [];

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1>❤️ Your Favorites</h1>
        <p>Movies you've saved to your favorites list.</p>
        <span className="favorites-count">{favorites.length} movies</span>
      </header>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">❤️</span>
          <h3>No favorites yet</h3>
          <p>Start adding movies to your favorites list.</p>
          <a href="/search" className="empty-link">🔍 Search for movies</a>
        </div>
      ) : (
        <div className="movie-grid">
          {favoriteMovies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              onClick={() => openDetails(movie.imdbID)}
            />
          ))}
        </div>
      )}

      {showModal && selectedMovie && (
        <MovieDetails movie={selectedMovie} onClose={closeDetails} />
      )}
    </div>
  );
}

export default FavoritesPage;