# Dar Al Najah Advertising

Website for Dar Al Najah Advertising, a printing, embroidery, gifting and photo studio business in Dubai.

**Stack:** Next.js 16 (React 19) · Convex (database, file storage, auth) · Vercel

## Run locally

```bash
cd web
npm install
npx convex dev   # terminal 1: syncs web/convex to your dev database
npm run dev      # terminal 2: http://localhost:3000
```

Copy `web/.env.example` to `web/.env.local`. `npx convex dev` fills in the Convex values for you.

## Project layout

| Path | What it is |
|---|---|
| `web/src/app/(site)` | Public pages |
| `web/src/app/admin` | Staff dashboard (sign in required) |
| `web/convex` | Database schema and server functions |
| `web/public/brand` | Logo files used by the site |
| `design/brand` | Original logo artwork |

## Deploy

- Pushing to `main` deploys the website on Vercel (Root Directory: `web`).
- Changes in `web/convex` are deployed with `npx convex deploy` from `web/`.
