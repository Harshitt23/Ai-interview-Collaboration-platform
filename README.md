# InterviewLab — AI Interview & Collaborative Coding Platform

A real-time collaborative coding interview platform. Open a room, share a link, and run a full technical interview in one place — a shared code editor, live code execution, a curated problem bank, a synced timer, chat, and structured feedback saved to your history.

🔗 **Live demo:** https://ai-interview-collaboration-platform.vercel.app

> Tip: open the room in two browser windows (one normal, one incognito) to see the real-time collaboration, chat, and participant sync in action.

---

## ✨ Features

- **Real-time collaborative editor** — a shared [Monaco](https://microsoft.github.io/monaco-editor/) editor (the engine behind VS Code) with live sync between participants, late-joiner state catch-up, and echo-safe updates.
- **Live code execution** — run JavaScript, TypeScript, Python, Java, and C++ directly in the room via the [Piston](https://github.com/engineer-man/piston) API. `Ctrl/Cmd + Enter` to run.
- **Curated problem bank** — one click loads a vetted DSA problem (arrays, strings, graphs, DP, and more) with examples, constraints, and colored topic tags.
- **Synced interview timer** — a drift-proof countdown every participant sees in sync (broadcast-once, computed locally).
- **Built-in live chat** — side-channel messaging with unread badges.
- **Roles & sharing** — host/candidate role badges and a one-click "copy invite link".
- **Structured feedback** — at the end of a session the interviewer rates the candidate (1–5) and logs strengths/improvements, saved to **Interview History**.
- **Dashboard** — animated stat counters (interviews, average rating, rooms created), recent activity, and a "how it works" guide.
- **Polish** — toast notifications, dark/light theme toggle, loading states, accessible focus styles, and a responsive layout.

---

## 🛠 Tech Stack

| Layer | Technologies |
| ------- | ------------- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Monaco Editor, Zustand, lucide-react |
| **Backend** | Node.js, Express 5, Socket.IO, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + bcrypt |
| **Code execution** | Piston API |
| **Deployment** | Vercel (client) · Render (server) · Supabase (database) |

---

## 🏗 Architecture

```
Browser  ──HTTP──▶  Express API (auth, feedback)  ──▶  PostgreSQL (Prisma)
         │
         ──WebSocket──▶  Socket.IO   (rooms, code sync, timer, chat, interview state)
         │
         ──HTTP──────▶  Piston API   (sandboxed code execution)
```

- **REST** handles authentication and feedback persistence.
- **Socket.IO** powers everything real-time: room join/leave, code broadcasting, interview start/end, the shared timer, and chat. Room state (current code, problem, timer) is cached server-side so late joiners catch up instantly.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local, or hosted e.g. Supabase)

### 1. Clone

```bash
git clone https://github.com/Harshitt23/Ai-interview-Collaboration-platform.git
cd "ai-interview + collaboratiove platform"
```

### 2. Backend (`/server`)

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_platform"
JWT_SECRET="your-secret-key"
CLIENT_URL="http://localhost:3000"
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev                   # http://localhost:5000
```

### 3. Frontend (`/client`)

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:5000"
```

Start:

```bash
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000, sign up, and create a room.

---

## 📁 Project Structure

```
.
├── client/                                       # Next.js app
│   ├── app/
│   │   ├── page.tsx                              # Landing page
│   │   ├── login, signup/                        # Auth pages
│   │   ├── dashboard/                            # Dashboard (stats, create/join)
│   │   ├── room/[roomId]/                        # Interview room (editor, problem, chat, timer)
│   │   ├── history/                              # Past interview feedback
│   │   └── profile/                              # Account page
│   ├── components/                               # Logo, Toast, UserMenu, ThemeToggle, Aurora, Counter
│   └── lib/                                      # api, socket, auth store, activity log
│
├── server/                                       # Express + Socket.IO API
│   └── src/
│       ├── controllers/                          # auth, feedback
│       ├── routes/                               # /api/auth, /api/feedback
│       ├── middleware/                           # JWT auth guard
│       ├── sockets/                              # real-time room logic + problem bank
│       └── utils/                               # Prisma client
│   └── prisma/                                   # schema + migrations
│
└── docs/                                         # Day-by-day build notes (day-01 → day-15)
```

---

## 🗺 Roadmap

- AI-generated interview problems (LLM-backed problem bank)
- Persisted rooms & shareable post-interview reports
- A "Try demo" account for instant exploration
- Multi-cursor presence in the editor

---

## 📖 About

Built as a structured, day-by-day full-stack learning project — see [`docs/`](./docs) for the build log. Covers auth, real-time systems with Socket.IO, the Prisma/PostgreSQL data layer, third-party API integration, and production deployment across Vercel, Render, and Supabase.
