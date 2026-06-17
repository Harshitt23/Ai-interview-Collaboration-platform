# Day 11 — Real-Time Chat Panel

## Objective

Add a collapsible chat sidebar so the interviewer and candidate can communicate via text during the session. Messages are delivered in real time via Socket.IO with an unread badge when the panel is closed.

---

## Architecture Overview

### No Message Persistence (Intentional)

Chat messages are not stored anywhere — not in a database, not in a server-side Map. This is a deliberate choice:

- **Simplicity** — no schema changes, no Prisma migration
- **Privacy** — messages disappear when the session ends, which is often desirable for interview chats
- **Late joiners** — they won't see chat history, which is acceptable (they missed the live session)

If you wanted persistence later, you'd add a `roomMessages` array on the server (like `roomCode`) or write to a `Message` table in the database.

### Client-Side Only for Self Messages

When you send a message, it's added to local state immediately without waiting for the server to echo it back. The server only broadcasts to other participants (`socket.to(roomId)` not `io.to(roomId)`). This avoids duplicate messages and makes the UI feel instant.

---

## What Was Built

### Server: `chat-message` Event

```ts
socket.on("chat-message", ({ roomId, text }) => {
  if (roomId !== currentRoom) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  socket.to(roomId).emit("chat-message", { socketId: socket.id, text: trimmed });
});
```

Two guards:
1. `roomId !== currentRoom` — cross-room injection protection (same as `code-change`)
2. Empty string check — don't broadcast blank messages

### Client: State

```ts
interface ChatMessage {
  socketId: string;
  text: string;
  self?: boolean;
}

const [chatOpen, setChatOpen] = useState(false);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [chatInput, setChatInput] = useState("");
const [unread, setUnread] = useState(0);
const chatEndRef = useRef<HTMLDivElement | null>(null);
```

### Client: Send Message

```ts
const handleSendMessage = useCallback(() => {
  const text = chatInput.trim();
  if (!text) return;
  setMessages((prev) => [...prev, { socketId: "you", text, self: true }]);
  getSocket().emit("chat-message", { roomId, text });
  setChatInput("");
}, [chatInput, roomId]);
```

`useCallback` prevents this function from being recreated on every render — important because it's referenced in the `onKeyDown` handler of the input.

### Client: Receive Message + Unread Badge

```ts
socket.on("chat-message", ({ socketId, text }) => {
  setMessages((prev) => [...prev, { socketId, text }]);
  setChatOpen((open) => {
    if (!open) setUnread((n) => n + 1);
    return open;
  });
});
```

Note the pattern: reading `chatOpen` inside `setChatOpen`'s updater function. This avoids a stale closure — if we read `chatOpen` directly in the socket handler, it would always have the value from when the effect ran (likely `false`), never updating as the user opens/closes the panel.

### Client: Auto-Scroll

```ts
const chatEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

A `<div ref={chatEndRef} />` sits at the bottom of the message list. Every time `messages` changes, the view scrolls to it.

### Client: Clear Unread on Open

```ts
useEffect(() => {
  if (chatOpen) setUnread(0);
}, [chatOpen]);
```

### Client: Message Bubble Layout

```
Others:              You:
┌──────────────┐    ┌──────────────┐
│ ab           │    │              │
│ Hello there  │    │   Hi! ←──── │
└──────────────┘    └──────────────┘
Left-aligned        Right-aligned
Dark background     Indigo background
Shows socketId      No label
```

---

## Concepts Learned

- **`socket.to(room)` vs `io.to(room)`** — for chat, `socket.to` is correct: the sender already added the message locally, so we only send to others
- **Stale closure problem with socket listeners** — reading state inside a socket handler captures the value at effect-mount time; use the state updater function's callback form to read current value
- **`useCallback`** — memoizes a function so it's not recreated on every render; important when passing functions to event listeners
- **Auto-scroll with a ref** — placing a `<div ref>` at the bottom of a list and calling `scrollIntoView` is the standard React pattern for scroll-to-bottom

---

## Mistakes to Avoid

- **Don't use `io.to(roomId)` for chat** — the sender would receive their own message back and see duplicates
- **Don't read `chatOpen` directly in a socket handler** — it's a stale closure; use the updater form `setChatOpen(open => { ... })`
- **Don't forget `socket.off("chat-message")` in cleanup** — stale listeners accumulate on hot reload and cause duplicate message rendering
- **Don't persist chat in a server-side Map** — unless you explicitly want history; messages sent before joining are usually irrelevant to a late joiner

---

## Current Project Status

Backend
✅ `chat-message`: guarded, trimmed, broadcast to room (excluding sender)

Frontend
✅ `💬 Chat` toggle button in top bar
✅ Red unread badge with count
✅ 280px collapsible chat panel (right side)
✅ Self messages: right-aligned, indigo
✅ Other messages: left-aligned, dark, shows sender ID prefix
✅ Auto-scroll to latest message
✅ Enter key or ↑ button to send
✅ Unread count resets on open

---

## Git Commit Message

```
feat: real-time chat panel with unread badge

- Server: chat-message event — guarded, trimmed, broadcast via socket.to
- Client: collapsible 280px chat panel toggled from top bar
- Self messages added locally (no echo from server)
- Incoming messages increment unread badge when panel is closed
- Unread badge resets when panel is opened
- Auto-scroll to latest message via chatEndRef
- Stale closure avoided using setChatOpen updater form
```
