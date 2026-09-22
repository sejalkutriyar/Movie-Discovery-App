# Movie Discovery App

A full-stack movie discovery application built with **React + Node.js**, using **TMDB** as the
external movie data source. Users can browse trending movies, discover titles by genre and sort
order, search, view details, and save movies to a persistent wishlist.

## Tech Stack

- **Frontend:** React + Vite, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite via Node's built-in `node:sqlite` module (no native compilation required)
- **External API:** [TMDB](https://www.themoviedb.org/documentation/api)
- **Caching:** In-memory TTL cache (`node-cache`) in front of all TMDB calls

## Setup Instructions

### Option A — Docker (recommended, one command)

1. Copy `.env.example` to `.env` in the project root and add your TMDB API key:
   ```
   TMDB_API_KEY=your_key_here
   ```
2. Run:
   ```
   docker compose up --build
   ```
3. Open `http://localhost:5173`

### Option B — Run locally without Docker

**Backend:**
```
cd backend
npm install
cp .env.example .env   # then add your TMDB_API_KEY
npm run dev
```
Runs on `http://localhost:4000`

**Frontend** (in a separate terminal):
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:5173`

Get a free TMDB API key at: https://www.themoviedb.org/settings/api

## Approach

The brief asked for a movie discovery *product*, not just an API demo, so the priorities were:
real-world failure handling, a backend that fully owns the shape of the data it exposes, and a
frontend that feels responsive even on a flaky network.

**Backend as an abstraction layer.** The client never talks to TMDB directly. All TMDB calls go
through a single service (`services/tmdbService.js`) that normalizes TMDB's raw, inconsistent
response shapes (nullable poster paths, genre data shaped differently on list vs. detail
endpoints) into one stable `Movie` object the frontend can always rely on.

**Caching and resilience.** Every TMDB call is wrapped in a cache-or-fetch pattern
(`services/cacheService.js`) with retry + backoff on transient failures, and falls back to
serving the last-known-good cached response if TMDB is down or rate-limited, rather than failing
the request outright.

**Frontend responsiveness under rapid input.** The search page debounces input and cancels
in-flight requests with `AbortController`, so quickly changing the search query never results in
stale results flashing on screen.

**Wishlist persistence.** Wishlist items are stored in SQLite with a denormalized snapshot
(title, poster, year, rating) so the wishlist page renders instantly even if TMDB is temporarily
unreachable — full details are only fetched live when a specific movie is opened.

## Key Technical Decisions

| Decision | Reasoning |
|---|---|
| `node:sqlite` instead of `better-sqlite3` | Avoids a native compilation step (`node-gyp`/Visual Studio Build Tools) entirely — same on-disk SQLite format, zero setup friction for anyone running the project. |
| In-memory cache instead of Redis | The dataset (movie lookups, search results) and traffic scale of this assignment don't justify a separate cache service; `node-cache`'s TTL + stale-fallback behavior covers the brief's caching/rate-limit requirements without extra infrastructure. |
| URL query params drive Search state | Preserves context on back/forward navigation and page refresh, per the brief's explicit requirement. |
| Denormalized wishlist snapshot | Lets the wishlist page render without depending on TMDB being reachable at that moment. |
| Optimistic UI for wishlist add/remove | The toggle needs to feel instant; the UI updates immediately and only rolls back if the backend call actually fails. |

## Extra Features (beyond the base requirements)

- **Because You Liked X** — a personalized row on the Home page, based on the most common genre
  in the user's wishlist (backend tracks a `genre_id` per wishlist entry for this).
- **Recently Viewed** — a localStorage-backed row showing the last movies opened.
- **Light/Dark theme toggle** — persisted preference, applied via CSS variables.
- **Docker + docker-compose** — one-command setup for the full stack.
- **Skeleton loaders, empty states, and error states with retry** on every async section, instead
  of bare spinners or blank screens.
- **Infinite scroll** on Discover and Search results via `IntersectionObserver`.

## Assumptions

- A single-user, local-first wishlist was assumed (no authentication) — appropriate for the scope
  of this assignment. In a multi-user product, the wishlist table would be keyed by user ID.
- TMDB's `popularity`/`vote_average` sort orders were treated as sufficient sort options; no
  custom ranking algorithm was built.
- "Large result sets" was interpreted as TMDB's own paginated results (up to ~500 pages per
  query) rather than an unbounded dataset requiring server-side infinite indexing.

## Known Limitations

- No automated test suite yet (would add Jest tests for the normalization layer and core routes
  with more time — see below).
- The in-memory cache is per-process and resets on server restart; a production deployment with
  multiple backend instances would need a shared cache (e.g. Redis) for consistent behavior.
- No authentication — wishlist is local to whoever is using the app instance.
- Trailer previews, advanced filters (year range, minimum rating), and toast notifications were
  considered but not implemented in this pass to keep scope manageable within the timeline.

## What I'd Improve With More Time

- Add a Jest test suite for the backend (normalization edge cases, cache fallback behavior,
  wishlist CRUD).
- Add user accounts so the wishlist isn't tied to a single local database.
- Move the in-memory cache to Redis for multi-instance deployments.
- Add trailer previews (TMDB's `/movie/{id}/videos` endpoint) and richer filters (year range,
  minimum rating) on the Discover page.
- Add toast/snackbar notifications for wishlist actions instead of relying solely on button state.

## AI Tools Used

Claude was used throughout this project as a development assistant: scaffolding the initial
backend and frontend structure, debugging a Windows-specific native-compilation issue with
`better-sqlite3` (resolved by switching to Node's built-in `node:sqlite`), writing Docker
configuration, and reviewing/explaining code as it was built. The architecture (abstraction-layer
backend, caching/retry strategy, wishlist data model, frontend state management) and all final
implementation decisions were mine — I can walk through and modify any part of this codebase.