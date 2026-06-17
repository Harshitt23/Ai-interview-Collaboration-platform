# Day 8 — Late-Joiner Sync, Debounce & Code Execution

## Objective

Three production-grade problems to solve: (1) users who join mid-session see a blank editor, (2) every keystroke floods the network with socket events, (3) there's no way to actually run the code. Fix all three.

---

## Architecture Overview

### Problem 1: Late-Joiner Code Sync

When a second person joins a room that already has code in it, they get a blank Monaco editor. The server has been broadcasting code changes, but this new socket missed all of them — it wasn't connected yet.

**Industry pattern:** Server-side state cache. The server keeps the last known code for each room in a `Map`. When a new socket joins, the server returns the current code in the `join-room` acknowledgment callback.

This is the same pattern used in collaborative tools like Figma and Google Docs — new clients receive a snapshot of current state, then start receiving incremental updates.

### Problem 2: Debouncing Code Changes

Without debouncing, every single keystroke emits a `code-change` event over the network. In a 45-minute interview session, a fast typist could generate thousands of socket events per minute. This wastes bandwidth and can cause visible lag.

**Industry pattern:** Debounce — wait until the user pauses typing before emitting. 300ms is the standard threshold used by most collaborative editors. It's short enough to feel real-time but long enough to batch rapid keystrokes.

### Problem 3: Code Execution

An interview platform where you can't run code is just a text editor. We need to execute arbitrary code server-side without building or hosting a sandbox ourselves.

**Piston API** (emkc.org) is a free, open-source code execution engine supporting 50+ languages. It accepts code as a string and returns stdout/stderr. Used by many open-source interview platforms.

**Tradeoff vs. building your own:**
- Piston: free, zero ops, instant, but external dependency and rate-limited
- Own sandbox (Docker): full control, no limits, but complex to build and host
- AWS Lambda: scalable, but costs money and requires setup

For learning and early-stage products, Piston is the right call.

---

## What Was Built

### Server: `roomCode` Map for Late-Joiner Sync

```ts
const roomCode = new Map<string, string>();

socket.on("join-room", ({ roomId }, callback?) => {
  socket.join(roomId);
  currentRoom = roomId;
  socket.to(roomId).emit("user-joined", { socketId: socket.id });
  callback?.(roomCode.get(roomId) ?? null); // ← send current code
});

socket.on("code-change", ({ roomId, code }) => {
  if (roomId !== currentRoom) return;
  roomCode.set(roomId, code); // ← keep it updated
  socket.to(roomId).emit("code-change", { code });
});
```

The `callback?.(...)` pattern is Socket.IO's **acknowledgment** feature — the server can call a function that was passed from the client as a callback. It's like a return value for socket events.

### Client: Ack Callback on `join-room`

```ts
socket.emit("join-room", { roomId }, (currentCode: string | null) => {
  if (currentCode) setCode(currentCode);
});
```

### Client: Debounce with `useRef`

Using `useRef` (not `useState`) for the timeout ID is deliberate — changing a ref does not trigger a re-render. We don't want the component re-rendering every time the debounce timer resets.

```ts
const emitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleEditorChange = (value: string | undefined) => {
  const newCode = value ?? "";

  if (isRemoteChange.current) {
    isRemoteChange.current = false;
    return;
  }

  setCode(newCode);

  if (emitTimeout.current) clearTimeout(emitTimeout.current);
  emitTimeout.current = setTimeout(() => {
    getSocket().emit("code-change", { roomId, code: newCode });
  }, 300);
};
```

Always clear the timeout in the cleanup function to avoid emitting after unmount:

```ts
return () => {
  if (emitTimeout.current) clearTimeout(emitTimeout.current);
  socket.emit("leave-room", { roomId });
};
```

### Client: Piston Code Execution

```ts
const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const pistonLang: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "c++",
};

const handleRunCode = async () => {
  setIsRunning(true);
  setOutput("Running...");
  try {
    const res = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLang[language] ?? language,
        version: "*",
        files: [{ content: code }],
      }),
    });
    const data = await res.json();
    setOutput(
      data.run?.output?.trim() ||
      data.run?.stderr?.trim() ||
      "(no output)"
    );
  } catch {
    setOutput("Error: could not reach execution service.");
  } finally {
    setIsRunning(false);
  }
};
```

`version: "*"` tells Piston to use the latest available version of the language.

The output panel is 200px tall, closeable with ✕, and sits at the bottom of the editor column.

---

## Concepts Learned

- **Socket.IO acknowledgments** — server calling a client-provided callback to return data from an event, like a response body for a socket event
- **Server-side state cache** — keeping a `Map<roomId, lastKnownState>` so late joiners can catch up
- **Debounce pattern with `useRef`** — batching rapid events without triggering re-renders
- **External code execution APIs** — delegating sandboxed execution to a third-party service

---

## Architecture Learned

```
Late Joiner Flow:
─────────────────
Client joins room
  → emit("join-room", { roomId }, callback)
                                ↓
                    Server: socket.join(roomId)
                    Server: callback(roomCode.get(roomId))
                                ↓
  ← callback fires with current code
  → setCode(currentCode) ← editor pre-filled

Debounce Flow:
──────────────
User types "hello" (5 keystrokes in 200ms)
  → clearTimeout, set new 300ms timer (×5)
  → timer fires once after last keystroke
  → emit("code-change") ← 1 event instead of 5

Code Execution Flow:
────────────────────
User clicks ▶ Run
  → POST https://emkc.org/api/v2/piston/execute
  → { language, version, files: [{ content: code }] }
  ← { run: { output, stderr } }
  → display in output panel
```

---

## Mistakes to Avoid

- **Don't use `useState` for timeout IDs** — it triggers unnecessary re-renders every time the timer resets
- **Don't forget to `clearTimeout` on unmount** — a stale timeout can emit events after the component is gone, causing "can't perform state update on unmounted component" warnings
- **Don't pass `version: "latest"`** to Piston — it doesn't accept that string; use `"*"` for latest
- **Don't assume `data.run.output` exists** — always check both `output` and `stderr`; some languages write errors to stderr, not stdout

---

## Current Project Status

Backend
✅ `roomCode` Map — late-joiner sync via ack callback
✅ Code change debounced on client (300ms)

Frontend
✅ Late joiner receives current code on join
✅ Debounced `code-change` emit
✅ ▶ Run button — executes code via Piston API
✅ Output panel (200px, closeable)

---

## Git Commit Message

```
feat: late-joiner code sync, debounce, Piston code execution

- Server: roomCode Map stores latest code per room
- join-room ack callback returns current code to late joiners
- Debounce code-change emit (300ms) with useRef timeout
- Clear debounce timeout on unmount
- Add Run button: POST to Piston API for code execution
- Output panel: shows stdout/stderr, closeable with ✕
```
