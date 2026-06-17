# Day 7 — Dashboard UI, Monaco Editor & Bug Fixes

## Objective

Replace the plain textarea with a professional code editor, build the room creation/joining flow on the dashboard, show connected participants, and fix 5 real-world bugs discovered in a code review.

---

## Architecture Overview

### Why Monaco Editor?

The browser textarea has no concept of programming languages. Monaco is the same engine that powers VS Code — it gives you syntax highlighting, auto-indentation, bracket matching, and theme support out of the box. In production interview platforms (CoderPad, HackerRank), a real editor is non-negotiable.

### Why uuidv4 for Room IDs?

Room IDs need to be:
- Unguessable (so strangers can't join by incrementing an integer)
- Unique (no collisions between sessions)
- Shareable (short enough to paste)

UUID v4 satisfies all three. In production you might use a shorter nanoid, but UUID is the industry standard for unique identifiers.

---

## What Was Built

### Dashboard (`client/app/dashboard/page.tsx`)

Two actions:

**Create Room** — generates a UUID client-side and navigates to `/room/{uuid}`. No server call needed at this stage because the room is created implicitly when the first socket joins.

**Join Room** — text input accepts a room ID, navigates on Enter or button click.

```ts
const handleCreateRoom = () => {
  const roomId = uuidv4();
  router.push(`/room/${roomId}`);
};

const handleJoinRoom = () => {
  if (!joinId.trim()) return;
  router.push(`/room/${joinId.trim()}`);
};
```

### Monaco Editor (`client/app/room/[roomId]/page.tsx`)

Replaced `<textarea>` with `@monaco-editor/react`:

```tsx
<Editor
  height="100%"
  language={language}
  value={code}
  onChange={handleEditorChange}
  theme="vs-dark"
  options={{
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
  }}
/>
```

Language selector drives the `language` prop — Monaco applies the correct tokenizer automatically.

### Participant Avatars

Each connected socket ID is stored in a `participants` string array. Avatars are rendered as initials circles:

```tsx
{participants.map((id) => (
  <span key={id} title={id}>
    {id.slice(0, 2).toUpperCase()}
  </span>
))}
```

### Server: `user-left` on Disconnect

Previously, when a browser tab closed, the `disconnect` event fired but no `user-left` was emitted to the room. Other participants saw ghost avatars forever.

```ts
socket.on("disconnect", () => {
  if (currentRoom) {
    socket.to(currentRoom).emit("user-left", { socketId: socket.id });
  }
});
```

---

## 5 Bugs Fixed (Code Review)

### Bug 1 — Cross-Room Code Injection

**Problem:** A socket in room A could emit `code-change` with `roomId: "room-B"` and overwrite room B's code.

**Fix:** Guard every `code-change` handler with a `currentRoom` check:

```ts
socket.on("code-change", ({ roomId, code }) => {
  if (roomId !== currentRoom) return; // ← guard
  roomCode.set(roomId, code);
  socket.to(roomId).emit("code-change", { code });
});
```

**Why it matters:** Without this, any client can corrupt any room. This is a classic authorization-at-the-socket-layer mistake.

### Bug 2 — Orphaned Room State

**Problem:** On `leave-room`, the socket left the Socket.IO room but `currentRoom` on the server wasn't reset. A later `code-change` from the same socket could still reference the old room.

**Fix:**
```ts
socket.on("leave-room", ({ roomId }) => {
  socket.leave(roomId);
  socket.to(roomId).emit("user-left", { socketId: socket.id });
  if (currentRoom === roomId) currentRoom = null; // ← reset
});
```

### Bug 3 — No Auth Guard on Room Page

**Problem:** Unauthenticated users could navigate directly to `/room/anything` and join a session.

**Fix:** Added the same hydrate + redirect pattern used on the dashboard:

```ts
useEffect(() => {
  if (!isLoading && !user) router.push("/login");
}, [isLoading, user, router]);
```

### Bug 4 — Ghost Participants

**Problem:** When a user disconnected abruptly (tab close, network drop), no `user-left` event reached the room, so their avatar stayed visible to others permanently.

**Fix:** Emit `user-left` inside the `disconnect` handler (see server section above).

### Bug 5 — Duplicate Participant on Rejoin

**Problem:** If a socket already in the `participants` array reconnected (e.g. hot reload), their ID was pushed again, showing duplicate avatars.

**Fix:** Deduplicate on the `user-joined` handler:

```ts
socket.on("user-joined", ({ socketId }) => {
  setParticipants((prev) =>
    prev.includes(socketId) ? prev : [...prev, socketId]
  );
});
```

---

## Industry Best Practice: Defense in Depth

The server should **never trust the client** about which room they belong to. The `currentRoom` variable on the server is the source of truth — not the `roomId` sent in each event payload. This is the same principle as server-side session validation in REST APIs.

---

## Concepts Learned

- **Monaco Editor** integration via `@monaco-editor/react` — controlled component pattern (`value` + `onChange`)
- **UUID v4** for unguessable, unique room identifiers
- **Socket authorization** — guarding events against cross-room interference
- **Ref-based state tracking** on the server (`currentRoom` per socket closure)
- **Deduplication** in React state updates

---

## Architecture Learned

```
Client                          Server
──────                          ──────
Dashboard
  → uuidv4()                    
  → router.push(/room/id)       

Room Page
  → socket.emit(join-room)  →   socket.join(roomId)
                                currentRoom = roomId
                            ←   emit(user-joined) to room
  → Monaco onChange         →   guard: roomId === currentRoom?
                            →   emit(code-change) to room
  ← socket.on(user-left)       socket.on(disconnect)
                            →   emit(user-left) if currentRoom
```

---

## Mistakes to Avoid

- Never use an auto-increment integer as a room ID — it's trivially guessable
- Never trust `roomId` from the client payload to authorize socket actions — use server-side `currentRoom`
- Always clean up `currentRoom` on `leave-room` and `disconnect`, not just on one
- Always deduplicate participant arrays — React state updates can fire multiple times

---

## Current Project Status

Backend
✅ Room join/leave with proper cleanup
✅ `user-left` on disconnect
✅ Cross-room injection guard

Frontend
✅ Dashboard: create & join room
✅ Monaco Editor with language selector
✅ Participant avatars with deduplication
✅ Auth guard on room page

---

## Git Commit Message

```
feat: dashboard room flow, Monaco editor, participant avatars, 5 bug fixes

- Add create/join room UI on dashboard (uuidv4 room IDs)
- Replace textarea with Monaco editor + language selector (JS/TS/Python/Java/C++)
- Show connected participant avatars (socketId initials)
- Fix cross-room code injection (currentRoom guard on server)
- Fix orphaned currentRoom ref after leave-room
- Fix missing auth guard on room page
- Fix ghost participants (user-left on disconnect)
- Fix duplicate participant avatar on rejoin
```
