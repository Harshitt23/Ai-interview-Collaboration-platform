# Day 4 — Frontend Authentication Integration

## Objective

Connect the frontend with the backend authentication system and build the first complete end-to-end full-stack feature.

---

# Topics Covered

- Axios API integration
- Frontend signup page
- Frontend login page
- JWT storage
- Dashboard redirect
- Protected frontend routes
- Authentication flow
- Docker debugging

---

# Frontend Structure Created

app/
├── signup/
│ └── page.tsx
│
├── login/
│ └── page.tsx
│
├── dashboard/
│ └── page.tsx

Purpose:
- Signup interface
- Login interface
- Protected dashboard

---

# Axios Setup

Created:

client/lib/api.ts

Purpose:
- Centralized API communication
- Reusable backend requests

Base URL:

http://localhost:5000/api

---

# Frontend Signup Integration

Connected:

POST /api/auth/signup

Flow:

User Input
↓
Axios Request
↓
Express Route
↓
Controller
↓
Prisma
↓
PostgreSQL

Result:

✅ User created successfully

---

# Frontend Login Integration

Connected:

POST /api/auth/login

Flow:

Email + Password
↓
Backend Verification
↓
JWT Generated
↓
Token Returned
↓
Frontend Stores Token

Result:

✅ Login successful

---

# JWT Storage

Used:

```js
localStorage.setItem("token", token);
```

Purpose:

- Persist login session
- Access protected pages

---

# Dashboard Redirect

Implemented:

```ts
router.push("/dashboard");
```

Flow:

Login Success
↓
Store JWT
↓
Redirect Dashboard

Result:

✅ Automatic navigation after login

---

# Protected Frontend Route

Dashboard now checks:

```js
localStorage.getItem("token");
```

Logic:

Token Exists?
↓
Yes → Dashboard
No → Redirect Login

Result:

✅ Protected frontend page

---

# Major Debugging Issue

## Problem

Frontend signup kept failing.

Initial assumptions:

- Axios issue
- API issue
- Frontend bug

Actual cause:

❌ PostgreSQL container not running

---

# Diagnosis

Used:

```bash
docker ps
```

Found:

Database container offline.

---

# Resolution

Started Docker Desktop.

Verified container:

```bash
docker ps
```

Database became available.

Result:

✅ Signup immediately worked

---

# Important Learning

Before debugging code:

Always verify:

- Docker
- Database
- Backend Server
- Environment Variables

Infrastructure problems often look like application bugs.

---

# Full Authentication Flow

Signup
↓
Store User
↓
Login
↓
Verify Password
↓
Generate JWT
↓
Store JWT
↓
Redirect Dashboard
↓
Protect Dashboard Access

---

# Current Project Status

Frontend

✅ Signup Page  
✅ Login Page  
✅ Dashboard Page  
✅ Protected Dashboard  

Backend

✅ Signup API  
✅ Login API  
✅ JWT Authentication  
✅ Middleware  

Database

✅ PostgreSQL  
✅ Prisma ORM  

Infrastructure

✅ Docker Running  

Authentication

✅ End-to-End Working

---

# Biggest Achievement

Built first complete full-stack feature:

Frontend
↓
Axios
↓
Express
↓
Prisma
↓
PostgreSQL
↓
JWT
↓
localStorage
↓
Protected Dashboard

---

# Technologies Used

Frontend:

- Next.js
- React
- Axios

Backend:

- Express
- TypeScript

Authentication:

- JWT
- bcrypt

Database:

- PostgreSQL
- Prisma

Infrastructure:

- Docker

---

# Major Learnings

- Frontend API integration
- JWT storage
- Authentication flow
- Protected routes
- Redirect handling
- Axios requests
- Docker debugging
- Full-stack request lifecycle

---

# Next Steps

- Current User API
- Logout functionality
- Auto-login on refresh
- Global auth state
- User profile integration
- Better dashboard UI
- Realtime collaboration foundation