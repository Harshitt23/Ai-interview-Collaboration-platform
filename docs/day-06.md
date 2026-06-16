# Day 6 — Realtime Collaboration Foundation

## Objective

Lay the groundwork for live, shared interview rooms using Socket.io.

---

# Topics Covered

- Socket.io server setup
- Socket.io client singleton
- Room-based connections
- Broadcasting code changes
- Avoiding echo loops on the client

---

# Backend: Socket.io Server

Installed:

```
socket.io
```

Created:

```
server/src/sockets/code.socket.ts
```

Wired into `server/src/index.ts`:

```ts
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

registerCodeSocket(io);

httpServer.listen(PORT, ...);
```

Note: switched from `app.listen` to `createServer(app)` so the same HTTP server
can be shared between Express and Socket.io.

---

# Socket Events

```
join-room    → client joins a room by roomId
code-change  → broadcast code edits to everyone else in the room
disconnect   → cleanup logging
```

Server-side handling:

```ts
socket.on("join-room", ({ roomId }) => {
  socket.join(roomId);
  socket.to(roomId).emit("user-joined", { socketId: socket.id });
});

socket.on("code-change", ({ roomId, code }) => {
  socket.to(roomId).emit("code-change", { code });
});
```

`socket.to(roomId)` broadcasts to everyone in the room **except** the sender.

---

# Frontend: Socket Client

Installed:

```
socket.io-client
```

Created:

```
client/lib/socket.ts
```

Singleton pattern to avoid creating a new connection on every render:

```ts
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:5000");
  }
  return socket;
};
```

---

# Room Page

Created:

```
client/app/room/[roomId]/page.tsx
```

Flow:

```
Mount
   ↓
emit("join-room", { roomId })
   ↓
listen("code-change") → update local textarea
   ↓
User types → emit("code-change", { roomId, code })
```

---

# Important Learning

## Avoiding the Echo Loop

Without a guard, applying an incoming `code-change` to local state would re-trigger
the change handler and re-emit the same edit back to the room. Solved with a ref flag:

```ts
const isRemoteChange = useRef(false);

socket.on("code-change", ({ code }) => {
  isRemoteChange.current = true;
  setCode(code);
});

const handleChange = (value: string) => {
  setCode(value);
  if (isRemoteChange.current) {
    isRemoteChange.current = false;
    return;
  }
  socket.emit("code-change", { roomId, code: value });
};
```

---

# Current Project Status

Backend

✅ Socket.io server running alongside Express
✅ Room join/leave via `socket.join`
✅ Code change broadcast per room

Frontend

✅ Socket client singleton
✅ Room page with live shared textarea
✅ Echo loop avoided

---

# Current Limitations

- Editor is a plain `<textarea>` — no syntax highlighting, no cursor presence
- No persistence — code is lost on refresh/disconnect
- No room creation flow — `roomId` must be navigated to manually

---

# Next Step

- Replace textarea with a real code editor (Monaco/CodeMirror)
- Persist room code server-side
- Show connected participants
- Room creation/joining UI
