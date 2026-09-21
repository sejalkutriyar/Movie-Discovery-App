import * as db from '../db/wishlistDb.js';

export function list(req, res) {
  res.json({ results: db.listWishlist() });
}

export function add(req, res) {
  const { id, title, posterUrl, year, rating, genreId } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'id and title are required' });
  const results = db.addToWishlist({ id, title, posterUrl, year, rating, genreId });
  res.status(201).json({ results });
}

export function remove(req, res) {
  const results = db.removeFromWishlist(req.params.id);
  res.json({ results });
}

export function topGenre(req, res) {
  res.json({ genreId: db.getTopWishlistGenre() });
}