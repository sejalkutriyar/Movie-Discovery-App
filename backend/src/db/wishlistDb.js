import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', '..', config.dbPath.replace(/^\.\//, ''));

// Ensure directory exists (in case DB_PATH points somewhere not yet created)
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Using Node's built-in node:sqlite module instead of better-sqlite3.
// Same on-disk SQLite format, but zero native compilation step — avoids
// requiring Visual Studio Build Tools / node-gyp on Windows entirely.
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    movie_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    poster_url TEXT,
    year TEXT,
    rating REAL,
    added_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Storing a denormalized snapshot (title/poster/year/rating) alongside the
// id means the wishlist page can render instantly even if TMDB is down —
// only re-fetches full details when a card is actually opened.

export function listWishlist() {
  return db.prepare('SELECT * FROM wishlist ORDER BY added_at DESC').all();
}

export function isWishlisted(movieId) {
  const row = db.prepare('SELECT 1 FROM wishlist WHERE movie_id = ?').get(movieId);
  return !!row;
}

export function addToWishlist(movie) {
  db.prepare(
    `INSERT OR REPLACE INTO wishlist (movie_id, title, poster_url, year, rating, added_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`
  ).run(movie.id, movie.title, movie.posterUrl ?? null, movie.year ?? null, movie.rating ?? null);
  return listWishlist();
}

export function removeFromWishlist(movieId) {
  db.prepare('DELETE FROM wishlist WHERE movie_id = ?').run(movieId);
  return listWishlist();
}

export default db;
