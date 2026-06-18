# Day 14 — Production Deployment (Vercel + Render + Supabase)

## Objective

Deploy the full-stack application to production:
- **Client** (Next.js) → Vercel
- **Server** (Express + Socket.IO) → Render
- **Database** (PostgreSQL) → Supabase

---

## Architecture Overview

### The Three-Service Model

A full-stack app in production lives across three separate platforms. Each handles a different concern:

```
Browser → Vercel (Next.js) → Render (Express API) → Supabase (PostgreSQL)
                         ↕ Socket.IO (real-time)
```

This is the industry standard for solo/small-team projects. It's free, scalable to a point, and each service is independently replaceable.

### Why Not One Server?

You could run your Next.js app and Express server on the same machine — but that means:
- One crash takes down everything
- You can't scale them independently
- Deploys are more complex

Splitting them means the frontend deploys in seconds (Vercel CDN), while the backend only redeploys when server code changes.

### Environment Variables: Local vs Production

The biggest mental shift in deployment is understanding that `.env.local` only exists on your machine. Every platform has its own env var system:

| Platform | Where to set |
|----------|-------------|
| Local | `.env.local` (Next.js) / `.env` (Node) |
| Vercel | Project → Settings → Environment Variables |
| Render | Service → Environment tab |
| Supabase | It IS the database — gives you the connection string |

`NEXT_PUBLIC_` prefix matters: Next.js only exposes env vars to the browser if they start with `NEXT_PUBLIC_`. Server-only secrets (JWT, DB URL) should never have this prefix.

---

## What Was Built / Configured

### Vercel (Client)

- Connected GitHub repo, set root directory to `client/`
- Added environment variable: `NEXT_PUBLIC_SERVER_URL` = Render server URL
- Fixed `client/lib/api.ts` to use `process.env.NEXT_PUBLIC_SERVER_URL` instead of hardcoded localhost
- Fixed `client/lib/socket.ts` same way
- Fixed `client/app/room/[roomId]/page.tsx` feedback fetch to use env var

### Render (Server)

- Created Web Service, set root directory to `server/`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Added environment variables:
  - `DATABASE_URL` — Supabase connection string (pooler, port 6543)
  - `JWT_SECRET` — same secret as local
  - `CLIENT_URL` — Vercel deployment URL (no trailing slash, no random suffix)
  - `PORT` — Render sets this automatically

### Supabase (Database)

- Created project, PostgreSQL hosted on Supabase infrastructure
- Ran `prisma migrate deploy` to apply migrations to production DB
- **Critical**: Used Connection Pooler URL (port 6543, Transaction mode) — not the direct connection (port 5432), which Render blocks

### `server/package.json` — Prisma generate on deploy

```json
"postinstall": "npx prisma generate"
```

Render runs `npm install` which triggers `postinstall` → Prisma client gets generated in the build environment. Without this, the server crashes immediately because the Prisma client isn't built.

### `server/tsconfig.json` — Build output

```json
{
  "outDir": "./dist",
  "rootDir": "./src"
}
```

`npm run build` compiles TypeScript → `dist/`, then `npm run start` runs `node dist/index.js`.

---

## Bugs Encountered (and Fixed)

### 1. `Can't reach database server at db.xxx.supabase.co:5432`

**Cause:** Render blocks outbound connections on port 5432 (direct Supabase connection).  
**Fix:** Use Supabase's Connection Pooler URL from the "Connect" button → port 6543, Transaction mode.

### 2. CORS error on all API calls

**Cause:** `CLIENT_URL` on Render was set to the wrong Vercel URL (had a random suffix like `-p52bkc21v`).  
**Fix:** Updated `CLIENT_URL` to the clean production URL: `https://ai-interview-collaboration-platform.vercel.app`

### 3. `@` in password breaks DATABASE_URL

**Cause:** `postgresql://user:pass@word@host/db` — the parser reads the first `@` as the user/host separator.  
**Fix:** URL-encode special characters in passwords: `@` → `%40`

### 4. Prisma named import error

**Cause:** `import { prisma } from "../utils/prisma"` — file uses default export.  
**Fix:** `import prisma from "../utils/prisma"`

### 5. Express 5 wildcard CORS preflight

**Cause:** `app.options("*", cors())` is invalid in Express 5.  
**Fix:** `app.options("/{*wildcard}", cors())`

---

## Concepts Learned

- **Environment variables per platform** — `.env.local` is local only; each deploy target has its own env system
- **`NEXT_PUBLIC_` prefix** — required for any env var that the browser needs to read
- **Supabase pooler vs direct connection** — port 5432 (direct) is often firewalled; port 6543 (pooler, Transaction mode) works everywhere
- **`postinstall` script** — runs after every `npm install`, perfect for build-time codegen like `prisma generate`
- **URL encoding in connection strings** — special characters in passwords must be percent-encoded
- **CORS origin must be exact** — a single wrong character in `CLIENT_URL` blocks every API request

---

## Mistakes to Avoid

- **Never hardcode localhost URLs in client code** — always use env vars, even in development
- **Never put secrets in `NEXT_PUBLIC_` vars** — they get embedded in the client bundle
- **Don't use the direct Supabase URL on hosted platforms** — always use the pooler
- **Always check `CLIENT_URL` matches the exact Vercel URL** — no trailing slash, no build-hash suffix
- **Don't commit `.env` files** — they should be in `.gitignore`

---

## Current Project Status

Backend (Render)
✅ Express + Socket.IO server live
✅ Prisma connected to Supabase via pooler
✅ CORS configured for production Vercel URL
✅ All API routes working (`/api/auth`, `/api/feedback`)

Frontend (Vercel)
✅ Next.js app deployed
✅ All env vars pointing to Render server
✅ Login, signup, dashboard, room, history all functional

Database (Supabase)
✅ PostgreSQL live
✅ Migrations applied
✅ User and Feedback tables created

---

## What's Next (Day 15)

- Remove debug `console.log` statements from production code
- Polish UI — loading states, error messages, empty states
- Final end-to-end test of the full interview flow in production

---

## Git Commit Message

```
feat: Day 14 — production deployment (Vercel + Render + Supabase)

- Client deployed to Vercel with NEXT_PUBLIC_SERVER_URL env var
- Server deployed to Render with postinstall prisma generate
- Database on Supabase using connection pooler (port 6543)
- Fixed CORS CLIENT_URL, URL-encoded password, Express 5 wildcard route
```
