import { useLocalStorage } from './useLocalStorage';

const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [items, setItems] = useLocalStorage('recentlyViewed', []);

  function recordView(movie) {
    setItems((prev) => {
      const withoutDupe = prev.filter((m) => m.id !== movie.id);
      return [
        { id: movie.id, title: movie.title, posterUrl: movie.posterUrl, year: movie.year, rating: movie.rating },
        ...withoutDupe,
      ].slice(0, MAX_ITEMS);
    });
  }

  return { items, recordView };
}