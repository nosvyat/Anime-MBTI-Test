# Anime MBTI Test

Phase 2 version of the Telegram Mini App with a static frontend and Node.js + SQLite backend.

## Structure

- `frontend/` — Telegram Mini App UI on HTML, CSS and vanilla JavaScript
- `backend/` — Express API, SQLite bootstrap, MBTI calculation services and REST routes

## Features

- 3 test modes: `quick` (24), `medium` (40), `full` (60)
- Telegram user upsert via WebApp user data with local fallback
- Server-side session progress saving
- Server-side result calculation and persistence
- History of completed runs
- Expanded character system with icons, images, descriptions and traits
- LocalStorage cache and offline fallback with re-sync attempt

## Run locally

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Start the app server:

   ```bash
   npm start
   ```

3. Open:

   [http://127.0.0.1:3000](http://127.0.0.1:3000)

The backend serves the frontend statically, so one process is enough for local development.
