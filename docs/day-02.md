# Day 2 — Authentication System (Part 1)

## Objective
Start building real backend authentication architecture using:
- Express
- Prisma
- PostgreSQL
- bcrypt

---

# Topics Covered

- Route modularization
- Controllers
- Request handling
- Prisma client setup
- Database queries
- Password hashing
- User signup API
- Error debugging

---

# Backend Architecture Introduced

Backend structure now follows scalable architecture:

src/
 ├── controllers
 ├── routes
 ├── middleware
 ├── utils

---

# Auth Route Creation

Created:
routes/auth.routes.ts

Purpose:
- define authentication endpoints
- separate routes from business logic

---

# Route Testing

Created test route:

GET /api/auth/test

Purpose:
- verify routing system
- verify modular architecture

---

# Controller Architecture

Created:
controllers/auth.controller.ts

Purpose:
- move business logic outside routes
- maintain clean scalable backend architecture

---

# Important Learning

## Route vs Controller

### Routes
Responsible for:
- endpoint definitions
- request mapping

Example:
POST /signup

---

### Controllers
Responsible for:
- business logic
- database queries
- validation
- response handling

---

# Prisma Utility Setup

Created:
utils/prisma.ts

Purpose:
- single reusable Prisma client instance
- avoid multiple database client creations

---

# Prisma Version Issues Faced

Major debugging session happened because Prisma 7 introduced breaking changes.

Problems faced:
- datasource URL handling changes
- Prisma client initialization changes
- schema validation changes

---

# Resolution

Downgraded Prisma to stable version:

prisma@6.19.0
@prisma/client@6.19.0

---

# Prisma Generate

Executed:

npx prisma generate

Purpose:
- generate typed Prisma client
- enable ORM access

---

# User Signup Logic

Implemented complete signup flow.

Features:
- request body extraction
- validation
- existing user check
- password hashing
- database insertion
- error handling

---

# Password Hashing

Used:
bcrypt

Code used:

bcrypt.hash(password, 10)

---

# Important Learning

## Why Password Hashing?

Never store plain passwords in database.

Wrong:
123456

Correct:
$2b$10$....

Benefits:
- protects user credentials
- secure against database leaks

---

# Signup API

Endpoint:

POST /api/auth/signup

Request Body:

{
  "name": "Harshit",
  "email": "harshit@test.com",
  "password": "123456"
}

---

# Signup Success Response

Received:

201 Created

Meaning:
- route worked
- controller worked
- Prisma query worked
- PostgreSQL insertion worked
- password hashing worked

---

# Database Interaction

Used Prisma query:

prisma.user.create()

Also used:

prisma.user.findUnique()

Purpose:
- check duplicate users
- insert new user

---

# Major Errors Faced Today

## auth.routes.ts is not a module
Reason:
- incomplete exports
- TypeScript module issues

Fix:
- proper export default router

---

## auth.controller.ts is not a module
Reason:
- incomplete try/catch block

Fix:
- complete controller structure

---

## PrismaClientInitializationError
Reason:
- Prisma 7 configuration incompatibility

Fix:
- downgrade to Prisma 6

---

## public.User does not exist
Reason:
- migration/table missing after Prisma reset

Fix:
npx prisma migrate dev --name init

---

# Important Learnings Today

- scalable backend architecture
- controller-based architecture
- Prisma ORM basics
- request validation
- password hashing
- database querying
- authentication flow basics
- debugging Prisma issues
- migration systems
- TypeScript backend debugging

---

# Current Authentication Flow

Client Request
   ↓
Route
   ↓
Controller
   ↓
Validation
   ↓
Prisma Query
   ↓
PostgreSQL
   ↓
Response

---

# Current Backend Features

Completed:
- modular routes
- controllers
- Prisma client utility
- signup API
- password hashing
- PostgreSQL insertion
- duplicate email checking

Pending:
- login API
- JWT generation
- auth middleware
- protected routes

---

# Current Project Status

Frontend:
✅ running

Backend:
✅ running

Database:
✅ connected

Signup Authentication:
✅ working

GitHub:
✅ updated

---

# Next Step

Implement:
- Login API
- JWT token generation
- authentication middleware
- protected route