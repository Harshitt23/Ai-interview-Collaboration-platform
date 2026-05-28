# Day 3 — JWT Authentication System

## Objective
Build complete authentication infrastructure using:
- JWT
- Express middleware
- bcrypt
- Prisma
- PostgreSQL

---

# Topics Covered

- Login API
- JWT token generation
- Password comparison
- Authentication middleware
- Protected routes
- Authorization headers
- Stateless authentication

---

# JWT Installation

Installed:

jsonwebtoken
@types/jsonwebtoken

Purpose:
- generate authentication tokens
- verify user identity
- protect routes

---

# Environment Variable Setup

Added:

JWT_SECRET

Inside:
.env

Purpose:
- sign JWT tokens securely
- verify tokens later in middleware

---

# Login API

Created:
POST /api/auth/login

Purpose:
- authenticate existing users
- verify password
- generate JWT token

---

# Login Flow

User submits:
- email
- password

Backend flow:

Request
   ↓
Find user from database
   ↓
Compare password using bcrypt
   ↓
Generate JWT token
   ↓
Send token to client

---

# Password Comparison

Used:

bcrypt.compare()

Purpose:
- compare plain password with hashed password
- securely validate credentials

---

# JWT Token Generation

Used:

jwt.sign()

Payload used:

{
  userId: user.id
}

Configuration:
- expiresIn: 7d

---

# JWT Structure Learning

Generated token looked like:

eyJhbGciOiJIUzI1Ni...

Important Learning:
JWT tokens contain:
- payload
- signature
- expiry

---

# Authentication Middleware

Created:
middleware/auth.middleware.ts

Purpose:
- protect private routes
- verify JWT tokens
- identify authenticated users

---

# Middleware Flow

Authorization Header
   ↓
Extract Bearer token
   ↓
Verify JWT
   ↓
Decode payload
   ↓
Attach userId to request
   ↓
Allow request

---

# Important Learning

## Bearer Token Format

Correct format:

Authorization: Bearer TOKEN

Important:
- space after Bearer
- token passed in headers

---

# Protected Route

Created:
GET /api/auth/me

Purpose:
- test authenticated access
- verify middleware functionality

---

# Protected Route Testing

Without token:
❌ Unauthorized

With valid JWT:
✅ Access granted

---

# Current Authentication Architecture

Signup
   ↓
Hash password
   ↓
Store in database
   ↓
Login
   ↓
Compare password
   ↓
Generate JWT
   ↓
Send token
   ↓
Client stores token
   ↓
Client sends token in Authorization header
   ↓
Middleware verifies token
   ↓
Protected route unlocked

---

# Important Backend Concepts Learned

## Stateless Authentication

Server does NOT store login sessions.

Instead:
- JWT token stores identity
- every request carries token
- middleware verifies authenticity

---

# Middleware Architecture

Middleware acts as:
- request interceptor
- security layer
- validation layer

Used before protected routes.

---

# Major Errors Faced Today

## Route Not Found (404)

Reason:
- used POST instead of GET

Learning:
HTTP methods matter.

---

## Middleware Route Registration Issues

Reason:
- protected route not registered correctly

Fix:
router.get("/me", authMiddleware, getMe)

---

## Prisma Reset Learning

Used:

npx prisma migrate reset

Purpose:
- clear database
- recreate schema
- rerun migrations

---

# Security Learnings

- never store plain passwords
- always hash passwords
- protect routes using middleware
- validate JWT tokens
- secure endpoints using Authorization headers

---

# Current Backend Features

Completed:
- signup API
- login API
- bcrypt hashing
- password verification
- JWT generation
- auth middleware
- protected routes
- PostgreSQL auth persistence

---

# Current Project Status

Frontend:
✅ running

Backend:
✅ running

Database:
✅ connected

Authentication:
✅ working

JWT Auth:
✅ working

Protected Routes:
✅ working

GitHub:
✅ updated

---

# Major Learnings Today

- JWT authentication architecture
- middleware systems
- stateless authentication
- protected routes
- authorization headers
- token verification
- Express middleware flow
- secure backend design

---

# Next Step

Build:
- current user API
- frontend authentication integration
- protected frontend pages
- Zustand auth state management
- realtime collaboration system