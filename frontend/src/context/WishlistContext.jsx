import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.wishlist
      .list()
      .then((res) => setItems(res.results || []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  const isWishlisted = useCallback((id) => items.some((m) => m.movie_id === id), [items]);

  const add = useCallback(async (movie) => {
    const optimisticItem = {
      movie_id: movie.id,
      title: movie.title,
      poster_url: movie.posterUrl,
      year: movie.year,
      rating: movie.rating,
      added_at: new Date().toISOString(),
    };
    setItems((prev) => [optimisticItem, ...prev.filter((m) => m.movie_id !== movie.id)]);
    try {
      await api.wishlist.add({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        year: movie.year,
        rating: movie.rating,
        genreId: movie.genres?.[0]?.id ?? null,
      });
    } catch {
      setItems((prev) => prev.filter((m) => m.movie_id !== movie.id));
    }
  }, []);

  const remove = useCallback(async (id) => {
    const previous = items;
    setItems((prev) => prev.filter((m) => m.movie_id !== id));
    try {
      await api.wishlist.remove(id);
    } catch {
      setItems(previous);
    }
  }, [items]);

  const toggle = useCallback(
    (movie) => (isWishlisted(movie.id) ? remove(movie.id) : add(movie)),
    [isWishlisted, add, remove]
  );

  return (
    <WishlistContext.Provider value={{ items, loaded, isWishlisted, add, remove, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}