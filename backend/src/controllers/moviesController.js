import * as tmdb from '../services/tmdbService.js';

export async function discover(req, res, next) {
  try {
    const { genre, sort, page } = req.query;
    const result = await tmdb.discoverMovies({ genre, sort, page: Number(page) || 1 });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const { q, page } = req.query;
    const result = await tmdb.searchMovies({ query: q, page: Number(page) || 1 });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function details(req, res, next) {
  try {
    const { id } = req.params;
    const result = await tmdb.getMovieDetails(id);
    if (!result.movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function similar(req, res, next) {
  try {
    const results = await tmdb.getSimilarMovies(req.params.id, Number(req.query.page) || 1);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function trending(req, res, next) {
  try {
    const results = await tmdb.getTrending();
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function genres(req, res, next) {
  try {
    const results = await tmdb.getGenres();
    res.json({ results });
  } catch (err) {
    next(err);
  }
}
