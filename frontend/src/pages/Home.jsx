import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { MovieGrid } from '../components/MovieGrid';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

export function Home() {
  const [trending, setTrending] = useState([]);
  const [trendingState, setTrendingState] = useState('loading');

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sort, setSort] = useState('popularity.desc');

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gridState, setGridState] = useState('loading');

  const [recommended, setRecommended] = useState([]);
  const [recommendedGenreName, setRecommendedGenreName] = useState(null);

  const { items: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    api.trending().then((res) => {
      setTrending(res.results || []);
      setTrendingState('ready');
    }).catch(() => setTrendingState('error'));

    api.genres().then((res) => setGenres(res.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (genres.length === 0) return;
    api.wishlist.topGenre()
      .then((res) => {
        if (!res.genreId) return;
        const genre = genres.find((g) => g.id === res.genreId);
        if (!genre) return;
        setRecommendedGenreName(genre.name);
        return api.discover({ genre: res.genreId, sort: 'popularity.desc', page: 1 });
      })
      .then((discoverRes) => {
        if (discoverRes) setRecommended(discoverRes.results.slice(0, 12));
      })
      .catch(() => {});
  }, [genres]);

  const loadDiscover = useCallback((targetPage, genre, sortValue, append) => {
    setGridState(append ? 'appending' : 'loading');
    api.discover({ genre, sort: sortValue, page: targetPage })
      .then((res) => {
        setMovies((prev) => (append ? [...prev, ...res.results] : res.results));
        setTotalPages(res.totalPages || 1);
        setGridState('ready');
      })
      .catch(() => setGridState('error'));
  }, []);

  useEffect(() => {
    setPage(1);
    loadDiscover(1, selectedGenre, sort, false);
  }, [selectedGenre, sort, loadDiscover]);

  const sentinelRef = useInfiniteScroll(
    () => {
      if (gridState === 'ready' && page < totalPages) {
        const next = page + 1;
        setPage(next);
        loadDiscover(next, selectedGenre, sort, true);
      }
    },
    { enabled: gridState === 'ready' && page < totalPages }
  );

  return (
    <div className="page">
      <section className="hero-row">
        <h2>Trending This Week</h2>
        {trendingState === 'loading' && <SkeletonGrid count={6} />}
        {trendingState === 'error' && <ErrorState message="Couldn't load trending movies." />}
        {trendingState === 'ready' && (
          <div className="scroll-row">
            <MovieGrid movies={trending.slice(0, 12)} />
          </div>
        )}
      </section>

      {recommended.length > 0 && (
        <section>
          <h2>Because You Liked {recommendedGenreName}</h2>
          <div className="scroll-row">
            <MovieGrid movies={recommended} />
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section>
          <h2>Recently Viewed</h2>
          <div className="scroll-row">
            <MovieGrid movies={recentlyViewed} />
          </div>
        </section>
      )}

      <section>
        <h2>Discover</h2>
        <FilterBar
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          sort={sort}
          onSortChange={setSort}
        />
        {gridState === 'loading' && <SkeletonGrid />}
        {gridState === 'error' && (
          <ErrorState message="Couldn't load movies." onRetry={() => loadDiscover(1, selectedGenre, sort, false)} />
        )}
        {(gridState === 'ready' || gridState === 'appending') && <MovieGrid movies={movies} />}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {gridState === 'appending' && <SkeletonGrid count={6} />}
      </section>
    </div>
  );
}