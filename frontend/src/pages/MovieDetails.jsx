import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { MovieGrid } from '../components/MovieGrid';
import { ErrorState } from '../components/ErrorState';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

export function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [state, setState] = useState('loading');
  const { isWishlisted, toggle } = useWishlist();
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    setState('loading');
    api.details(id)
      .then((res) => {
        setMovie(res.movie);
        setState('ready');
        recordView(res.movie);
      })
      .catch(() => setState('error'));

    api.similar(id).then((res) => setSimilar(res.results || [])).catch(() => setSimilar([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (state === 'loading') return <div className="page"><p>Loading...</p></div>;
  if (state === 'error' || !movie) {
    return (
      <div className="page">
        <ErrorState message="Couldn't load this movie." />
        <Link to="/">← Back to home</Link>
      </div>
    );
  }

  const saved = isWishlisted(movie.id);

  return (
    <div className="page movie-details">
      <div className="movie-details__backdrop" style={{ backgroundImage: `url(${movie.backdropUrl})` }} />
      <div className="movie-details__content">
        <img src={movie.posterUrl} alt={movie.title} className="movie-details__poster" />
        <div className="movie-details__info">
          <h1>{movie.title} <span className="movie-details__year">({movie.year})</span></h1>
          <div className="movie-details__meta">
            {movie.rating != null && <span>★ {movie.rating}</span>}
            {movie.runtime && <span>{movie.runtime} min</span>}
            <span>{movie.genres.map((g) => g.name).join(', ')}</span>
          </div>
          <p className="movie-details__overview">{movie.overview}</p>
          <button className={`btn ${saved ? 'btn--saved' : 'btn--primary'}`} onClick={() => toggle(movie)}>
            {saved ? '♥ In Wishlist' : '♡ Add to Wishlist'}
          </button>
        </div>
      </div>

      {similar.length > 0 && (
        <section>
          <h2>You Might Also Like</h2>
          <MovieGrid movies={similar.slice(0, 12)} />
        </section>
      )}
    </div>
  );
}