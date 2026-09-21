const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { signal, ...options } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal,
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new ApiError(body?.error || 'Something went wrong.', res.status);
  }
  return body;
}

export const api = {
  discover: (params, opts) => request(`/api/movies/discover?${new URLSearchParams(params)}`, opts),
  search: (q, page, opts) => request(`/api/movies/search?q=${encodeURIComponent(q)}&page=${page}`, opts),
  trending: (opts) => request('/api/movies/trending', opts),
  genres: (opts) => request('/api/movies/genres', opts),
  details: (id, opts) => request(`/api/movies/${id}`, opts),
  similar: (id, opts) => request(`/api/movies/${id}/similar`, opts),
  wishlist: {
    list: (opts) => request('/api/wishlist', opts),
    add: (movie, opts) => request('/api/wishlist', { method: 'POST', body: JSON.stringify(movie), ...opts }),
    remove: (id, opts) => request(`/api/wishlist/${id}`, { method: 'DELETE', ...opts }),
    topGenre: (opts) => request('/api/wishlist/top-genre', opts),
  },
};

export { ApiError };