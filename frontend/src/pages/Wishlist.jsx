import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { EmptyState } from '../components/EmptyState';

export function Wishlist() {
  const { items, loaded, remove } = useWishlist();

  if (!loaded) return <div className="page"><p>Loading...</p></div>;

  if (items.length === 0) {
    return (
      <div className="page">
        <h2>Your Wishlist</h2>
        <EmptyState title="Your wishlist is empty" subtitle="Save movies you're interested in to find them here later." />
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Your Wishlist</h2>
      <div className="movie-grid">
        {items.map((item) => (
          <div className="movie-card" key={item.movie_id}>
            <Link to={`/movie/${item.movie_id}`} className="movie-card__link">
              <div className="movie-card__poster-wrap">
                <img src={item.poster_url} alt={item.title} loading="lazy" className="movie-card__poster" />
                {item.rating != null && <span className="movie-card__rating">★ {item.rating}</span>}
              </div>
              <h3 className="movie-card__title" title={item.title}>{item.title}</h3>
              <p className="movie-card__year">{item.year}</p>
            </Link>
            <button className="movie-card__wishlist-btn is-saved" onClick={() => remove(item.movie_id)}>
              ♥ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
