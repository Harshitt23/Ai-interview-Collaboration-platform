# Day 13 — Interview History Page

## Objective

Build a page where interviewers can review all their past sessions — ratings, strengths, and improvement notes — fetched from the database.

---

## Architecture Overview

### Why a Separate `/history` Route?

Dashboard is for **actions** (create/join room). History is for **reviewing data**. Mixing them makes both pages cluttered and violates the Single Responsibility Principle — each page should do one thing well.

### Prisma Query Pattern: `findMany` with `where` + `orderBy`

```ts
prisma.feedback.findMany({
  where: { interviewerId: userId },
  orderBy: { createdAt: "desc" },
})
```

This is the most common Prisma query pattern:
- `where` — filters rows (like SQL `WHERE`)
- `orderBy` — sorts results (like SQL `ORDER BY`)
- `"desc"` — newest first, which is what users always expect in a history list

The `interviewerId` comes from the JWT — users can only ever see their own feedback records. This is **row-level authorization** — a critical security pattern.

### Why Not Fetch All Feedbacks and Filter Client-Side?

Never send data to the client that the user isn't authorized to see, even if you plan to filter it before displaying. The DB query should be scoped from the start. If the table has 10,000 rows, sending all of them to filter client-side wastes bandwidth and leaks other users' data.

---

## What Was Built

### Server: `GET /api/feedback`

Added to the existing feedback controller and route:

```ts
export const getFeedbacks = async (req: AuthRequest, res: Response) => {
  const feedbacks = await prisma.feedback.findMany({
    where: { interviewerId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json({ success: true, feedbacks });
};
```

Route: `router.get("/", authMiddleware, getFeedbacks)`

### Client: `/history` Page

**Data fetching** — inside a `useEffect` that runs once the user is confirmed authenticated:

```ts
useEffect(() => {
  if (!user) return;
  const token = localStorage.getItem("token");
  fetch("http://localhost:5000/api/feedback", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => setFeedbacks(data.feedbacks ?? []))
    .finally(() => setIsFetching(false));
}, [user]);
```

**Accordion UI** — each session row is clickable and expands to show full strengths/improvements. Only one row open at a time (`expanded` state holds the open ID, clicking the same row closes it).

**Star rating display:**

```tsx
function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#333" }}>★</span>
      ))}
    </span>
  );
}
```

**Empty state** — when no feedback exists yet, shows a friendly prompt instead of a blank page.

### Dashboard: History Button

Added `📋 History` button in the top bar linking to `/history`.

---

## Concepts Learned

- **`prisma.findMany` with `where` + `orderBy`** — the standard pattern for filtered, sorted DB queries
- **Row-level authorization** — scoping DB queries to the authenticated user; never fetch more than the user is allowed to see
- **Accordion pattern** — single-open expandable list using one piece of state (`expanded: string | null`)
- **Two-phase loading** — `isLoading` (auth hydration) and `isFetching` (data fetch) are separate; show loading until both resolve
- **`?? []` fallback** — `data.feedbacks ?? []` prevents crashes if the API returns unexpected shape

---

## Mistakes to Avoid

- **Never filter data client-side for authorization** — always scope the DB query on the server
- **Don't fetch data before auth is confirmed** — the `useEffect` depends on `[user]`, so it only runs once the auth state is known
- **Don't share the `expanded` ID with the full feedback ID** — fine here since it's UUIDs, but in general be careful about exposing DB IDs in client state
- **Always handle the empty state** — a blank page with no feedback looks like a bug; an explicit empty state looks like a feature

---

## Current Project Status

Backend
✅ `GET /api/feedback` — JWT-protected, returns user's own feedback, newest first

Frontend
✅ `/history` page — accordion list of past sessions
✅ Star rating display
✅ Expandable strengths/improvements per session
✅ Empty state when no sessions exist
✅ Dashboard → History button

---

## What's Left (Day 14)

- Deployment: Vercel (client) + Railway (server + PostgreSQL)
- Environment variables for production
- CORS update for production URLs

---

## Git Commit Message

```
feat: interview history page with GET /api/feedback

- Server: GET /api/feedback — returns authenticated user's feedbacks, newest first
- Prisma: findMany with where(interviewerId) + orderBy(createdAt desc)
- Client: /history page — accordion list, star ratings, empty state
- Dashboard: add History button linking to /history
```
