import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { MovieGrid } from '../components/MovieGrid';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SearchBar } from '../components/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export function Search() {
  // URL is the source of truth for the query, so back/forward navigation
  // and page refresh preserve exactly what the user was searching for.
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [state, setState] = useState('idle'); // idle | loading | appending | ready | empty | error

  const abortRef = useRef(null);

  useEffect(() => {
    setParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });

    if (!debouncedQuery.trim()) {
      setMovies([]);
      setState('idle');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState('loading');
    setPage(1);
    api.search(debouncedQuery, 1, { signal: controller.signal })
      .then((res) => {
        setMovies(res.results || []);
        setTotalPages(res.totalPages || 1);
        setState((res.results || []).length ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // superseded by a newer keystroke, ignore
        setState('error');
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const loadMore = useCallback(() => {
    if (state !== 'ready' || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    setState('appending');
    api.search(debouncedQuery, next).then((res) => {
      setMovies((prev) => [...prev, ...res.results]);
      setState('ready');
    }).catch(() => setState('ready'));
  }, [state, page, totalPages, debouncedQuery]);

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: state === 'ready' && page < totalPages });

  return (
    <div className="page">
      <h2>Search Movies</h2>
      <SearchBar value={query} onChange={setQuery} />

      {state === 'idle' && <EmptyState title="Start typing to search" subtitle="Try a title, actor, or franchise." />}
      {(state === 'loading') && <SkeletonGrid />}
      {state === 'empty' && <EmptyState title={`No results for "${debouncedQuery}"`} subtitle="Try a different spelling or title." />}
      {state === 'error' && <ErrorState message="Search failed. The movie service may be busy." onRetry={() => setQuery((q) => q)} />}
      {(state === 'ready' || state === 'appending') && <MovieGrid movies={movies} />}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {state === 'appending' && <SkeletonGrid count={6} />}
    </div>
  );
}
