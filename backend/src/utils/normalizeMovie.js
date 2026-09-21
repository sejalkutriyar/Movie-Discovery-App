import { config } from '../config/env.js';

const PLACEHOLDER_POSTER = 'https://placehold.co/342x513?text=No+Poster';
const PLACEHOLDER_BACKDROP = 'https://placehold.co/1280x720?text=No+Image';

function posterUrl(path, size = 'w342') {
  return path ? `${config.tmdbImageBase}/${size}${path}` : PLACEHOLDER_POSTER;
}

function backdropUrl(path, size = 'w1280') {
  return path ? `${config.tmdbImageBase}/${size}${path}` : PLACEHOLDER_BACKDROP;
}

// TMDB genre_ids come back as raw numbers on list endpoints but full
// {id,name} objects on the detail endpoint. This resolves either shape
// against a genre lookup map so the client always gets [{id, name}].
export function normalizeMovie(raw, genreMap = {}) {
  if (!raw) return null;

  const genres = Array.isArray(raw.genres)
    ? raw.genres
    : Array.isArray(raw.genre_ids)
    ? raw.genre_ids.map((id) => ({ id, name: genreMap[id] || 'Unknown' }))
    : [];

  return {
    id: raw.id,
    title: raw.title || raw.original_title || 'Untitled',
    overview: raw.overview?.trim() || 'No description available.',
    posterUrl: posterUrl(raw.poster_path),
    backdropUrl: backdropUrl(raw.backdrop_path),
    year: raw.release_date ? raw.release_date.slice(0, 4) : 'N/A',
    releaseDate: raw.release_date || null,
    rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : null,
    voteCount: raw.vote_count ?? 0,
    runtime: raw.runtime ?? null, // only present on detail endpoint
    genres,
  };
}

export function normalizeMovieList(rawList, genreMap = {}) {
  return (rawList || []).map((m) => normalizeMovie(m, genreMap));
}
