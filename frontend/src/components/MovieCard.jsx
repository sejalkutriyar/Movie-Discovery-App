import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export function MovieCard({ movie }) {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(movie.id);

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-card__link">
        <div className="movie-card__poster-wrap">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            className="movie-card__poster"
          />
          {movie.rating != null && <span className="movie-card__rating">★ {movie.rating}</span>}
        </div>
        <h3 className="movie-card__title" title={movie.title}>{movie.title}</h3>
        <p className="movie-card__year">{movie.year}</p>
      </Link>
      <button
        className={`movie-card__wishlist-btn ${saved ? 'is-saved' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggle(movie);
        }}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {saved ? '♥ Saved' : '♡ Save'}
      </button>
    </div>
  );
}
