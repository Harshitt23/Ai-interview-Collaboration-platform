# Day 5 — Global Auth State with Zustand

## Objective

Replace raw `localStorage` token checks with a centralized, reactive auth state and complete the `current user` API.

---

# Topics Covered

- Zustand global state
- Auth hydration on app load
- Completing the `/api/auth/me` endpoint
- Logout flow
- Loading states for protected pages

---

# Backend: Completed `getMe`

Previously `getMe` was a stub returning a static message. Completed it to actually
fetch the authenticated user from the database using the `userId` attached by the
auth middleware:

```ts
export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true },
  });

  res.status(200).json({ success: true, user });
};
```

Result:

✅ `/api/auth/me` now returns the real logged-in user

---

# Frontend: Zustand Auth Store

Installed:

```
zustand
```

Created:

```
client/lib/store/authStore.ts
```

State shape:

```ts
{
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth(token, user);
  logout();
  hydrate();
}
```

Purpose:

- single source of truth for auth state
- avoid scattering `localStorage` reads across pages
- give pages a loading state instead of guessing

---

# Hydration Flow

On app/dashboard mount:

```
hydrate()
   ↓
Read token from localStorage
   ↓
No token → isLoading = false, user = null
   ↓
Token exists → call GET /api/auth/me
   ↓
Valid → set user + token, isLoading = false
   ↓
Invalid/expired → clear token, user = null, isLoading = false
```

---

# Login Page Updated

Before:

```js
localStorage.setItem("token", response.data.token);
```

After:

```js
setAuth(response.data.token, response.data.user);
```

Store now owns writing to `localStorage` internally — pages no longer touch it directly.

---

# Dashboard Page Updated

Before:

- Read token directly from `localStorage` in a `useEffect`
- No loading state, no user info displayed

After:

- Calls `hydrate()` on mount
- Redirects to `/login` only once `isLoading` is false and there's no user
- Renders `Welcome, {user.name}` and a working logout button

```ts
const handleLogout = () => {
  logout();
  router.push("/login");
};
```

---

# Important Learning

## Race Condition Avoided

Checking `!token` synchronously on mount caused a flash-redirect before the async
`/auth/me` call could resolve. Fixed by gating the redirect behind `isLoading`:

```ts
if (!isLoading && !user) {
  router.push("/login");
}
```

---

# Current Project Status

Frontend

✅ Zustand auth store
✅ Hydration on load
✅ Logout button
✅ Loading state on dashboard

Backend

✅ `/api/auth/me` returns real user data

---

# Next Step

- Realtime collaboration foundation
- Socket.io client/server setup
- Shared code room
