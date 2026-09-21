import axios from 'axios';
import { config } from '../config/env.js';
import { getOrFetch } from './cacheService.js';
import { normalizeMovie, normalizeMovieList } from '../utils/normalizeMovie.js';

const client = axios.create({
  baseURL: config.tmdbBaseUrl,
  timeout: 6000, // fail fast rather than hanging the whole request chain
  params: { api_key: config.tmdbApiKey },
});

// Simple retry with backoff for transient failures (timeouts, 5xx, TMDB's
// own rate-limit 429). Not retried: 4xx client errors like bad requests.
async function requestWithRetry(path, params, attempts = 2) {
  let lastErr;
  for (let i = 0; i <= attempts; i++) {
    try {
      const res = await client.get(path, { params });
      return res.data;
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      const retryable = !status || status >= 500 || status === 429;
      if (!retryable || i === attempts) break;
      await new Promise((r) => setTimeout(r, 300 * (i + 1))); // 300ms, 600ms...
    }
  }
  throw lastErr;
}

let genreMapCache = null;
async function getGenreMap() {
  if (genreMapCache) return genreMapCache;
  const { data } = await getOrFetch('genres', async () => requestWithRetry('/genre/movie/list', {}));
  genreMapCache = Object.fromEntries((data.genres || []).map((g) => [g.id, g.name]));
  return genreMapCache;
}

export async function getGenres() {
  const { data } = await getOrFetch('genres', async () => requestWithRetry('/genre/movie/list', {}));
  return data.genres || [];
}

export async function discoverMovies({ genre, sort = 'popularity.desc', page = 1 } = {}) {
  const key = `discover:${genre || 'all'}:${sort}:${page}`;
  const genreMap = await getGenreMap();
  const { data, stale } = await getOrFetch(key, () =>
    requestWithRetry('/discover/movie', {
      with_genres: genre || undefined,
      sort_by: sort,
      page,
      include_adult: false,
    })
  );
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: normalizeMovieList(data.results, genreMap),
    stale: !!stale,
  };
}

export async function searchMovies({ query, page = 1 } = {}) {
  if (!query || !query.trim()) return { page: 1, totalPages: 0, totalResults: 0, results: [] };
  const key = `search:${query.toLowerCase()}:${page}`;
  const genreMap = await getGenreMap();
  const { data, stale } = await getOrFetch(
    key,
    () => requestWithRetry('/search/movie', { query, page, include_adult: false }),
    300 // shorter TTL for search — results/popularity shift more often
  );
  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: normalizeMovieList(data.results, genreMap),
    stale: !!stale,
  };
}

export async function getMovieDetails(id) {
  const key = `movie:${id}`;
  const genreMap = await getGenreMap();
  const { data, stale } = await getOrFetch(key, () => requestWithRetry(`/movie/${id}`, {}));
  return { movie: normalizeMovie(data, genreMap), stale: !!stale };
}

export async function getSimilarMovies(id, page = 1) {
  const key = `similar:${id}:${page}`;
  const genreMap = await getGenreMap();
  const { data } = await getOrFetch(key, () => requestWithRetry(`/movie/${id}/similar`, { page }));
  return normalizeMovieList(data.results, genreMap);
}

export async function getTrending() {
  const key = 'trending:week';
  const genreMap = await getGenreMap();
  const { data } = await getOrFetch(key, () => requestWithRetry('/trending/movie/week', {}));
  return normalizeMovieList(data.results, genreMap);
}
