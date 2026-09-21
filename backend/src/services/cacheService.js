import NodeCache from 'node-cache';
import { config } from '../config/env.js';

// Single shared cache instance. checkperiod prunes expired keys periodically
// so memory doesn't grow unbounded with lots of distinct search queries.
const cache = new NodeCache({
  stdTTL: config.cacheTtlSeconds,
  checkperiod: 120,
});

/**
 * getOrFetch: the core "avoid unnecessary requests" mechanism.
 * If a value exists for `key`, return it immediately.
 * Otherwise call `fetchFn`, cache the result, and return it.
 *
 * If `fetchFn` fails AND we have a stale (already-expired-but-not-yet-evicted)
 * value is not tracked by node-cache once expired, so instead we keep a
 * secondary "lastKnownGood" store to serve stale data when TMDB is down —
 * better a slightly outdated result than a broken page.
 */
const lastKnownGood = new Map();

export async function getOrFetch(key, fetchFn, ttlSeconds) {
  const cached = cache.get(key);
  if (cached !== undefined) return { data: cached, fromCache: true };

  try {
    const fresh = await fetchFn();
    cache.set(key, fresh, ttlSeconds ?? config.cacheTtlSeconds);
    lastKnownGood.set(key, fresh);
    return { data: fresh, fromCache: false };
  } catch (err) {
    if (lastKnownGood.has(key)) {
      console.warn(`[cache] fetch failed for "${key}", serving stale data`, err.message);
      return { data: lastKnownGood.get(key), fromCache: true, stale: true };
    }
    throw err;
  }
}

export function invalidate(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  cache.del(keys);
}
