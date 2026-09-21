import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', '..', config.dbPath.replace(/^\.\//, ''));

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    movie_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    poster_url TEXT,
    year TEXT,
    rating REAL,
    genre_id INTEGER,
    added_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Safe migration: if an older DB (created before genre_id existed) is opened,
// add the column. Fails silently if it's already there.
try {
  db.exec('ALTER TABLE wishlist ADD COLUMN genre_id INTEGER');
} catch {
  // column already exists — fine
}

export function listWishlist() {
  return db.prepare('SELECT * FROM wishlist ORDER BY added_at DESC').all();
}

export function isWishlisted(movieId) {
  const row = db.prepare('SELECT 1 FROM wishlist WHERE movie_id = ?').get(movieId);
  return !!row;
}

export function addToWishlist(movie) {
  db.prepare(
    `INSERT OR REPLACE INTO wishlist (movie_id, title, poster_url, year, rating, genre_id, added_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(movie.id, movie.title, movie.posterUrl ?? null, movie.year ?? null, movie.rating ?? null, movie.genreId ?? null);
  return listWishlist();
}

export function removeFromWishlist(movieId) {
  db.prepare('DELETE FROM wishlist WHERE movie_id = ?').run(movieId);
  return listWishlist();
}

// Finds the genre_id that appears most often in the wishlist — powers the
// "Because You Liked X" section on Home. Returns null if wishlist is empty
// or has no genre data.
export function getTopWishlistGenre() {
  const row = db
    .prepare(
      `SELECT genre_id, COUNT(*) as count FROM wishlist
       WHERE genre_id IS NOT NULL
       GROUP BY genre_id ORDER BY count DESC LIMIT 1`
    )
    .get();
  return row ? row.genre_id : null;
}

export default db;