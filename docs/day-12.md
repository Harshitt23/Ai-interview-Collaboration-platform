# Day 12 — End Interview + Interviewer Feedback

## Objective

Close the interview loop. The host can end the session, all participants see an "ended" screen, and the interviewer fills out a structured feedback form that is saved permanently to the database.

---

## Architecture Overview

### Why Save Feedback to the Database?

Socket state is ephemeral — it lives only as long as the server process runs. A server restart wipes everything. Feedback is business-critical data that needs to persist across restarts and be queryable later (Day 13: history page). The database is the right layer for this.

### Prisma Relation: Feedback belongs to User

```
User ──< Feedback
```

A user (the interviewer) can submit many feedback records. Each feedback belongs to one user. This is a **one-to-many** relation — the most common relation type in relational databases.

```prisma
model Feedback {
  id            String   @id @default(uuid())
  roomId        String
  rating        Int
  strengths     String
  improvements  String
  createdAt     DateTime @default(now())
  interviewer   User     @relation(fields: [interviewerId], references: [id])
  interviewerId String
}
```

`interviewerId` is the **foreign key** — a column in `Feedback` that references the `id` column in `User`. Prisma enforces referential integrity: you can't create a `Feedback` record with an `interviewerId` that doesn't exist in the `User` table.

### Who is the Host?

We have no `Room` table yet, so there's no server-side record of who created the room. Simple solution: whoever clicks "Start Interview" sets `isHost = true` in their local state. Only they see the "End Interview" button.

This is a **client-side trust model** — acceptable for now. In production, you'd store a `hostId` on the Room record and verify it on the server.

### REST for Feedback, Socket for End Signal

Two different transports for two different concerns:

- **Socket** (`end-interview` → `interview-ended`): real-time broadcast to all participants — this is inherently a pub/sub problem, sockets are the right tool
- **HTTP POST** (`/api/feedback`): persisting data — this is a standard CRUD operation, REST is the right tool

Mixing them the wrong way (e.g. emitting feedback over socket and trying to save it) would mean the server socket handler needs to know which socket belongs to which authenticated user — much more complex.

---

## What Was Built

### Prisma Migration

Added `Feedback` model and `feedbacks` relation on `User`. Ran:

```
npx prisma migrate dev --name add_feedback_table
```

This generated a SQL migration file and regenerated the Prisma Client.

### Server: `end-interview` Socket Event

```ts
socket.on("end-interview", ({ roomId }) => {
  if (roomId !== currentRoom) return;
  roomProblem.delete(roomId);
  roomTimer.delete(roomId);
  io.to(roomId).emit("interview-ended");
});
```

Cleans up server-side room state and broadcasts to everyone including the host (`io.to` not `socket.to`).

### Server: `POST /api/feedback`

Protected by `authMiddleware` — requires a valid JWT. The `interviewerId` comes from the verified token, not the request body (the client can't fake it).

```ts
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  const { roomId, rating, strengths, improvements } = req.body;
  const interviewerId = req.userId!; // from JWT, not body

  const feedback = await prisma.feedback.create({
    data: { roomId, rating: Number(rating), strengths, improvements, interviewerId },
  });

  return res.status(201).json({ success: true, feedback });
};
```

### Client: Ended Overlay

A `position: fixed` overlay covers the full viewport when `interviewState === "ended"`.

**Host sees:** Rating picker (1–5), Strengths textarea, Improvements textarea, Submit button. On submit → POST to `/api/feedback` with JWT from `localStorage`. After success → "✅ Feedback Submitted" confirmation.

**Candidate sees:** "🏁 Interview Complete" screen with a good luck message.

---

## Concepts Learned

- **Prisma one-to-many relations** — foreign key (`interviewerId`) + `@relation` directive
- **`prisma migrate dev`** — generates and applies a SQL migration, regenerates the Prisma Client
- **Never trust the client for identity** — `interviewerId` comes from the verified JWT on the server, not from the request body
- **REST vs Socket for different concerns** — real-time broadcast = socket, data persistence = HTTP
- **`position: fixed` overlay** — covers the full viewport regardless of scroll position, used for modals and end screens
- **Client-side host tracking** — simple `isHost` boolean set when the user initiates the interview; production would verify server-side

---

## Mistakes to Avoid

- **Never take `userId` from the request body** — a malicious client could send any ID and submit feedback as another user; always derive identity from the verified JWT
- **Don't forget to add the `feedbacks` array relation on `User`** — Prisma requires both sides of a relation to be declared
- **Don't use `socket.to` for `interview-ended`** — use `io.to` so the host also receives the event and sees the feedback form
- **Don't forget `Number(rating)`** — form inputs always return strings; the DB column is `Int`, Prisma will throw if you pass a string

---

## Current Project Status

Backend
✅ `Feedback` model in Prisma with User relation
✅ Migration applied to DB
✅ `end-interview` socket event — cleans room state, broadcasts to all
✅ `POST /api/feedback` — JWT-protected, saves to DB

Frontend
✅ `isHost` flag — set when user clicks Start Interview
✅ "⏹ End Interview" button — only visible to host during active interview
✅ `interview-ended` socket listener — transitions state to "ended"
✅ Ended overlay (fixed, full-screen):
  - Host: rating picker, strengths/improvements textareas, submit → DB
  - Candidate: completion screen

---

## Git Commit Message

```
feat: end interview flow + interviewer feedback saved to DB

- Prisma: add Feedback model with User relation, run migration
- Socket: end-interview event cleans roomProblem/roomTimer, broadcasts interview-ended
- Server: POST /api/feedback — JWT-protected, interviewerId from token (not body)
- Client: isHost flag set on Start Interview click
- End Interview button visible only to host during active interview
- Full-screen overlay on interview-ended:
  - Host: rating (1-5) + strengths + improvements → POST /api/feedback
  - Candidate: completion screen
```
