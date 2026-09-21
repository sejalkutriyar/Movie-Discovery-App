import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  tmdbApiKey: process.env.TMDB_API_KEY,
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBase: 'https://image.tmdb.org/t/p',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 900), // 15 min default
  dbPath: process.env.DB_PATH || './src/db/wishlist.sqlite',
};

if (!config.tmdbApiKey) {
  console.warn(
    '[config] TMDB_API_KEY is not set. Copy .env.example to .env and add your key from https://www.themoviedb.org/settings/api'
  );
}
