# Day 1 — Full Stack Project Initialization

## Objective
Setup complete scalable full stack development environment for AI Interview + Collaborative Coding Platform.

---

# Technologies Initialized

Frontend:
- Next.js
- React
- TypeScript
- TailwindCSS

Backend:
- Node.js
- Express.js
- TypeScript

Database:
- PostgreSQL

ORM:
- Prisma

Infrastructure:
- Docker Desktop

Version Control:
- Git + GitHub

---

# Environment Verification

## Commands Used

node -v
npm -v
git --version
docker --version
docker compose version

---

# Existing Versions Found

Node.js:
v24.16.0

npm:
11.4.2

Git:
2.50.0.windows.2

---

# Learning

Before installing software, existing versions should always be verified to avoid:
- duplicate installations
- dependency conflicts
- unnecessary setup

---

# Docker Installation

Installed Docker Desktop with WSL2 support.

Why Docker?
- containerized PostgreSQL
- isolated environments
- future Redis setup
- future code execution sandbox

---

# Frontend Initialization

Created frontend using:

npx create-next-app@latest client

Selected:
- TypeScript
- ESLint
- TailwindCSS
- App Router
- Turbopack

---

# Frontend Learnings

## App Router
Modern Next.js routing architecture.

Benefits:
- layouts
- server components
- scalable routing

---

# Backend Initialization

Created backend manually:

mkdir server
npm init -y

Installed:
- express
- cors
- dotenv
- bcrypt
- jsonwebtoken
- prisma
- socket.io

Installed Dev Dependencies:
- typescript
- ts-node-dev
- @types/node
- @types/express
- @types/cors
- @types/bcrypt
- @types/jsonwebtoken

---

# TypeScript Backend Setup

Initialized TypeScript:

npx tsc --init

Created backend structure:

src/
 ├── controllers
 ├── middleware
 ├── routes
 └── utils

---

# First Express Server

Created:
src/index.ts

Features:
- express initialization
- CORS
- JSON middleware
- test route

---

# Major Problems Faced

## TypeScript Module Errors

Error:
ECMAScript imports and exports cannot be written in a CommonJS file.

Reason:
Frontend tsconfig and backend tsconfig configurations became mixed.

---

# Fix Applied

Created separate backend tsconfig.

Final backend tsconfig:

{
  "compilerOptions": {
    "target": "ES2017",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

---

# Important Learning

Frontend and backend TypeScript configurations are completely different.

Frontend:
- React
- JSX
- Next.js plugins

Backend:
- Node.js runtime only

---

# PostgreSQL Setup

Created:
docker-compose.yml

Configured PostgreSQL container using Docker.

Configuration:

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_USER: harshit
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ai_platform
    ports:
      - "5432:5432"

Commands used:

docker compose up -d
docker ps

---

# Prisma Initialization

Initialized Prisma:

npx prisma init

Created:
- prisma/
- schema.prisma
- prisma.config.ts

---

# Database Connection Setup

Configured:
DATABASE_URL

Connected Prisma with PostgreSQL running inside Docker container.

---

# User Model Created

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

---

# Prisma Migration

Executed:

npx prisma migrate dev --name init

Result:
- database synchronized
- first table created successfully

---

# Git + GitHub Setup

Initialized Git repository.

Commands used:

git init
git add .
git commit -m "initial full stack setup"
git branch -M main
git remote add origin <repo-url>
git push -u origin main

---

# Major Learnings Today

- Difference between frontend/backend architecture
- Docker basics
- PostgreSQL containerization
- Prisma ORM basics
- TypeScript backend setup
- Express initialization
- Environment variable handling
- Prisma configuration
- CommonJS vs ESM
- Monorepo structure basics
- Git workflow
- Database migrations

---

# Current Project Structure

AI-INTERVIEW + COLLABORATIVE PLATFORM/
 ├── client/
 ├── server/
 ├── docs/
 │    └── day-01.md
 └── docker-compose.yml

---

# Current Status

Completed:
- frontend setup
- backend setup
- Docker setup
- PostgreSQL setup
- Prisma setup
- first database model
- database migration
- GitHub setup

Next Step:
We will Build authentication system using JWT and bcrypt.