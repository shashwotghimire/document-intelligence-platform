# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A RAG-based document intelligence platform. Users upload documents (PDF, DOCX, CSV, TXT), which are chunked and embedded as vectors. Chat queries perform semantic similarity search against document chunks and stream LLM responses grounded in retrieved context.

## Architecture

Two independent packages (no monorepo tooling — each has its own `node_modules`):

- **`api/`** — Express.js backend (TypeScript, Sequelize ORM, PostgreSQL + pgvector)
- **`web/`** — React 19 frontend (Vite, TailwindCSS v4, shadcn/ui)

## Development Commands

### Backend (`api/`)
```bash
cd api && npm install
npm run dev          # tsx watch src/server.ts (port 8080)
npm run build        # tsc
npm run start        # node dist/server.js
```

### Frontend (`web/`)
```bash
cd web && npm install
npm run dev          # vite dev server (port 5173)
npm run build        # tsc -b && vite build
npm run lint         # eslint .
```

No test framework is configured in either package.

## Environment Setup

Copy `api/.env.sample` and fill in:
- PostgreSQL connection (PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE)
- JWT_SECRET
- GEMINI_API_KEY (Google AI — used for embeddings and chat LLM)
- AWS S3 credentials (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET, AWS_S3_BUCKET)
- Email credentials for Nodemailer

PostgreSQL must have the `pgvector` extension enabled (`CREATE EXTENSION vector;`). Sequelize sync handles schema creation.

## Backend Structure

```
api/src/
├── server.ts              # Starts Express on PORT
├── app.ts                 # Mounts routes, middleware, CORS
├── db.ts                  # Sequelize + pgvector setup
├── models/                # Sequelize models (User, Document, DocumentChunk, Chat, Messages)
├── controllers/           # Route handlers
├── routes/                # Express router definitions
├── services/              # Business logic (LLM, embeddings, S3, document parsing, chunking)
├── middlewares/           # Auth (JWT), validation (Zod), error handling, roles, multer
├── validation/            # Zod schemas
└── utils/                 # JWT helpers, ApiError/ApiResponse classes, asyncHandler
```

**Key data flow for chat:** User message → embed query (Gemini embedding-001, 3072-dim) → pgvector cosine similarity → top-5 chunks → build prompt with context → stream response from Gemini 2.5 Flash → SSE to client.

**Document ingestion:** Upload file → S3 storage → parse text (pdf-parse/mammoth/csv-parse) → split into chunks (LangChain text splitters) → embed each chunk → store in DocumentChunk with vector.

## Frontend Structure

```
web/src/
├── main.tsx               # React Router + React Query providers
├── App.tsx                # Route definitions
├── pages/                 # Route-level components
├── components/            # UI (shadcn/ui in components/ui/, app components at top level)
├── service/               # API client layer (axios instance + per-domain API modules)
├── hooks/                 # Custom hooks
└── lib/                   # Utilities (cn helper, formatBytes)
```

**Path alias:** `@/*` maps to `src/*` (configured in vite.config.ts and tsconfig.app.json).

**State management:** React Query for server state. Axios interceptor adds Bearer token from localStorage and auto-redirects to login on 401.

**Streaming:** Chat responses use fetch + ReadableStream (not Axios) to read SSE chunks.

## API Routes

- `POST /api/auth/register|login`, `GET /api/auth/me`, `PATCH /api/auth/update-profile`
- `POST|GET /api/uploads`, `DELETE /api/uploads/:docId`
- `POST|GET|DELETE /api/chats(/:chatId)`
- `POST|GET /api/messages/:chatId` (POST streams the LLM response)
- `GET /api/health`

## Data Model

```
User (1→N) Document (1→N) DocumentChunk [has vector embedding]
User (1→N) Chat (1→N) Messages
```

User has roles: `user` | `admin`. Admin can block users and view stats.

## Conventions

- Standardized responses via `ApiResponse` class; errors via `ApiError` thrown inside `asyncHandler`
- Validation middleware applies Zod schemas to `req.body` before controller runs
- File uploads go through multer middleware (memory storage) then to S3
- Frontend uses shadcn/ui components (install new ones via `npx shadcn@latest add <component>` from `web/`)
