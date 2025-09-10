# iGame — Minimal Lobby UI

This repository contains a minimalistic React/Next UI for a simple realtime game lobby. The front-end lets a user sign in with a username, create or join a game session, pick a number, wait for a short countdown, and see the results.

## Approach

-   Authentication: the app uses a simple username-based sign-in flow. The backend performs JWT-based authentication and, on successful auth, creates a cookie session that the front-end sends with requests (fetches use credentials: include).
-   Realtime: Supabase Realtime (websockets) is used to observe game session state and session participants. The client subscribes to channels (examples in code: `games-session` and `session_participants-channel`) and updates the UI when sessions start, end, or when participants join/leave.
-   Lobby flow: when no active session exists a user may start a new session; otherwise they can join the active session. After joining, the player selects a number and waits for the countdown to end; the end-of-game result is fetched and displayed.

## Environment variables

Create a `.env.local` (or set environment variables in your hosting platform) with the following keys:

-   `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (required for realtime and client SDK).
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the Supabase anon/public key used by the client (required).
-   `NEXT_PUBLIC_ENABLE_LOGS` — optional, set to `true` to enable runtime debug logging from `src/lib/logger.ts`.

Notes:

-   The front-end expects the backend to perform JWT auth and to set an HTTP cookie session. The repository doesn't include server-side secret envs (JWT secret, DB credentials, etc.). Make sure your backend that authenticates users is configured to set cookies on the same origin (or adapt CORS/SameSite settings for cross-origin deployments).

## Local setup & run

1. Create `.env.local` with the variables above.
2. Install dependencies and run the dev server.

PowerShell example:

```powershell
pnpm install
pnpm dev
```

Open http://localhost:3000 (or the port printed by Next) and try the lobby flow.

## Where to look in the code

-   Supabase usage & realtime subscriptions: `src/app/lobby/page.tsx` and `src/app/game/page.tsx`.
-   Auth-aware fetch helper: `src/lib/fetchWithAuth.ts` (adds Authorization header and sets credentials to include).
-   Types for sessions and participants: `src/types/index.ts`.

## Quick troubleshooting

-   No realtime updates: verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct and that your Supabase project allows realtime (check project settings).
-   Auth/cookie issues: ensure the backend sets cookies with the correct domain and SameSite policy; the front-end uses `credentials: 'include'` when making API requests.
