# Day 10 — Synced Interview Timer

## Objective

Add a countdown timer visible to all participants simultaneously. When the host starts the interview, a 45-minute clock starts for everyone in the room and turns red in the last 5 minutes.

---

## Architecture Overview

### The Wrong Approach: Ticking via Socket

A naive implementation would have the server emit a `timer-tick` event every second to all clients. That's 2,700 socket events per interview session — wasteful, and it doesn't scale. If 100 rooms are running simultaneously, that's 270,000 events per minute just for timers.

### The Right Approach: Broadcast Once, Compute Locally

The server sends two numbers once:
- `startedAt` — the Unix timestamp (ms) when the interview started
- `duration` — total seconds (default 2700 = 45 min)

Each client independently runs a `setInterval` that computes:

```
remaining = duration - Math.floor((Date.now() - startedAt) / 1000)
```

This is **clock-drift-safe** — the countdown is always derived from wall-clock time, not from counting ticks. If a client's tab is backgrounded and the interval fires late, the next tick immediately corrects itself.

### Late Joiner Accuracy

A candidate who joins 10 minutes in automatically gets the correct remaining time — the formula uses `Date.now()` which is always current, and `startedAt` is retrieved from the `roomTimer` Map on join.

---

## What Was Built

### Server: `roomTimer` Map

```ts
interface RoomTimer {
  startedAt: number;
  duration: number;
}

const roomTimer = new Map<string, RoomTimer>();

socket.on("start-interview", ({ roomId, duration = 2700 }) => {
  if (roomId !== currentRoom) return;
  const problem = getRandomProblem();
  const timer: RoomTimer = { startedAt: Date.now(), duration };
  roomProblem.set(roomId, problem);
  roomTimer.set(roomId, timer);
  io.to(roomId).emit("interview-started", { problem, timer });
});
```

Late-joiner ack now includes timer:

```ts
callback?.({
  code: roomCode.get(roomId) ?? null,
  problem: roomProblem.get(roomId) ?? null,
  timer: roomTimer.get(roomId) ?? null,
});
```

### Client: `startTimer` Function

```ts
const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

const startTimer = (startedAt: number, duration: number) => {
  if (timerInterval.current) clearInterval(timerInterval.current);
  const tick = () => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    setTimeLeft(remaining);
    if (remaining === 0 && timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  };
  tick(); // run immediately so there's no 1-second delay on mount
  timerInterval.current = setInterval(tick, 1000);
};
```

Called on both `interview-started` and `join-room` ack.

### Client: Timer Display

```tsx
{timeLeft !== null && (
  <span style={{
    fontFamily: "monospace",
    fontSize: "18px",
    fontWeight: "bold",
    color: timeLeft <= 300 ? "#ef4444" : "#d4d4d4",
  }}>
    {timeLeft === 0 ? "Time's up!" : formatTime(timeLeft)}
  </span>
)}
```

```ts
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
```

---

## Concepts Learned

- **Broadcast-once, compute-locally** — the right pattern for synced timers at scale; avoids per-second socket traffic
- **Clock-drift resilience** — deriving remaining time from a fixed `startedAt` timestamp rather than counting ticks ensures accuracy even if intervals fire late
- **`useRef` for interval IDs** — same reason as timeout IDs: changing a ref doesn't cause a re-render
- **`tick()` called immediately** — avoids the 1-second blank before the first interval fires

---

## Mistakes to Avoid

- **Never emit a timer tick per second over sockets** — it's wasteful and doesn't scale; send `startedAt + duration` once
- **Don't use `useState` for the interval ID** — the ref won't trigger re-renders when cleared/reset
- **Always call `tick()` once before the first `setInterval`** — otherwise the display is blank for 1 second on mount
- **Always `clearInterval` on component unmount** — a leaked interval will keep calling `setTimeLeft` on an unmounted component
- **Use `Math.max(0, remaining)`** — without it, the timer goes negative if the tab is suspended past the end time

---

## Current Project Status

Backend
✅ `roomTimer` Map: stores `startedAt + duration` per room
✅ `interview-started` broadcasts `{ problem, timer }` together
✅ Late joiners receive timer in `join-room` ack

Frontend
✅ `startTimer(startedAt, duration)` — local interval, drift-safe
✅ `formatTime` — MM:SS display
✅ Timer in top bar, monospace font
✅ Turns red at ≤ 5 minutes remaining
✅ Shows "Time's up!" at 0
✅ Interval cleared on unmount

---

## Git Commit Message

```
feat: synced interview timer (broadcast-once, compute-locally)

- Server: roomTimer Map stores startedAt + duration on interview start
- interview-started payload includes timer alongside problem
- join-room ack returns timer for late joiners (correct remaining time)
- Client: drift-safe countdown derived from Date.now() - startedAt
- Timer display in top bar: MM:SS, monospace
- Turns red at ≤5 min, shows "Time's up!" at 0
- Interval cleared on unmount to prevent memory leaks
```
