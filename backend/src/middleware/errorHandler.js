// Central place that turns any thrown/rejected error (including axios errors
// from a down or rate-limited TMDB) into a consistent, safe JSON response.
// Keeping this in one place means every route gets the same graceful
// degradation behaviour without repeating try/catch logic everywhere.
export function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);

  const status = err.response?.status;

  if (status === 429) {
    return res.status(503).json({
      error: 'Movie service is temporarily rate-limited. Please try again shortly.',
    });
  }
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return res.status(504).json({ error: 'Movie service took too long to respond.' });
  }
  if (status === 404) {
    return res.status(404).json({ error: 'Not found.' });
  }
  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: 'Invalid request to movie service.' });
  }

  res.status(502).json({ error: 'Movie service is currently unavailable. Please try again later.' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}
