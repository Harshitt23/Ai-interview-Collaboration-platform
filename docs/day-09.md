# Day 9 — AI Interviewer Panel (Hardcoded Problem Pool)

## Objective

Split the room into two panes: left shows a coding problem, right has the editor. A "Start Interview" button picks a random problem from a server-side pool and broadcasts it to everyone in the room instantly.

---

## Architecture Overview

### Why Server-Side Problem Selection?

The problem pool lives on the server, not the client. This matters for two reasons:

1. **All participants see the same problem** — the server picks once and broadcasts via socket. If each client picked randomly, different participants would see different problems.
2. **Late joiners get the problem** — stored in a `roomProblem` Map, same pattern as `roomCode`. A candidate who reconnects mid-interview gets the problem immediately on `join-room`.

### Why Socket, Not HTTP?

We could have done `POST /api/interview/start` → server picks problem → returns it. But then we'd need to separately broadcast it to other room participants via Socket.IO anyway. Doing it entirely through the socket is simpler — one event triggers the pick and the broadcast in the same handler.

### Why a Hardcoded Pool?

Originally planned to use Claude API to generate problems dynamically. Scrapped because:
- Costs money per request
- Adds latency (AI generation takes seconds)
- Adds an external dependency that can fail

A curated pool of 16 real algorithmic problems (Easy/Medium/Hard) is actually better for an interview platform — problems are vetted, instant, and free.

---

## Problem Pool

16 problems covering the key categories interviewers test:

| Category | Problems |
|---|---|
| Arrays | Two Sum, 3Sum, Maximum Subarray, Merge Intervals |
| Strings | Longest Substring Without Repeating Characters, Longest Common Subsequence |
| Stack | Valid Parentheses |
| DP | Climbing Stairs, Coin Change |
| Linked List | Reverse Linked List |
| Trees | Validate BST |
| Graphs | Number of Islands |
| Search | Binary Search |
| Backtracking | Word Search |
| Two Pointers | Trapping Rain Water |
| Divide & Conquer | Median of Two Sorted Arrays |

Each problem has: `title`, `difficulty`, `description`, `examples[]`, `constraints[]`.

---

## What Was Built

### Server: `start-interview` Socket Event

```ts
const roomProblem = new Map<string, Problem>();

socket.on("start-interview", ({ roomId }) => {
  if (roomId !== currentRoom) return;
  const problem = getRandomProblem();
  roomProblem.set(roomId, problem);
  io.to(roomId).emit("interview-started", { problem });
});
```

Note: `io.to(roomId)` broadcasts to **everyone** including the sender. Used here intentionally — the host who clicked "Start Interview" also needs to see the problem panel open.

### Server: Late-Joiner Gets Problem Too

```ts
socket.on("join-room", ({ roomId }, callback?) => {
  // ...
  callback?.({
    code: roomCode.get(roomId) ?? null,
    problem: roomProblem.get(roomId) ?? null,
  });
});
```

### Client: Split Layout

When `interviewState === "active"`, the main content area splits:

```
┌──────────────────────────────────────────┐
│              Top Bar                     │
├─────────────────┬────────────────────────┤
│  Problem Panel  │    Monaco Editor       │
│     (40%)       │       (60%)            │
│                 │                        │
│                 ├────────────────────────┤
│                 │   Output Panel         │
└─────────────────┴────────────────────────┘
```

### Client: `interview-started` Listener

```ts
socket.on("interview-started", ({ problem }) => {
  setProblem(problem);
  setInterviewState("active");
});
```

On `join-room` ack:
```ts
if (payload.problem) {
  setProblem(payload.problem);
  setInterviewState("active");
}
```

### Difficulty Color Coding

```ts
const difficultyColor = {
  Easy: "#22c55e",   // green
  Medium: "#f59e0b", // amber
  Hard: "#ef4444",   // red
};
```

---

## Concepts Learned

- **`io.to(room)` vs `socket.to(room)`** — `socket.to` excludes the sender, `io.to` includes everyone. Use `io.to` when the action initiator also needs the update.
- **Server-side random selection for shared state** — never let clients independently randomize shared data
- **Extending existing ack callbacks** — adding new fields (`problem`) to the `join-room` ack without breaking existing behaviour (`code`)

---

## Mistakes to Avoid

- Don't use `socket.to(roomId)` for `interview-started` — the host who clicked the button would not see the problem panel open
- Don't store the problem pool on the client — all participants must receive the same problem from a single source of truth (the server)
- Don't forget to guard `start-interview` with `roomId !== currentRoom` — same cross-room injection risk as `code-change`

---

## Current Project Status

Backend
✅ 16-problem hardcoded pool (Easy/Medium/Hard)
✅ `start-interview` → random pick → `interview-started` broadcast
✅ `roomProblem` Map for late-joiner sync

Frontend
✅ "Start Interview" button (disappears once active)
✅ Split layout: 40% problem panel / 60% editor
✅ Problem panel: title, difficulty badge, description, examples, constraints
✅ Late joiner receives current problem on join

---

## Git Commit Message

```
feat: AI interviewer panel with hardcoded problem pool

- Server: 16-problem pool (Easy/Medium/Hard, all major DSA categories)
- start-interview socket event: random pick + broadcast to full room
- roomProblem Map: late joiners receive current problem on join-room ack
- Client: split layout (40% problem / 60% editor) when interview active
- Problem panel: difficulty badge, examples, constraints
- Start Interview button hidden once interview is active
```
