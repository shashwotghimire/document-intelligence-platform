# Document Intelligence Platform

A full-stack document question-answering platform. Admin users upload documents into a shared knowledge base, the backend extracts and embeds the document text, and authenticated users chat with an assistant that answers from the retrieved document context.

## Project Overview

The repository is split into two applications:

- `api/`: Express + TypeScript backend for authentication, user/admin management, document ingestion, vector search, chat persistence, and streaming LLM responses.
- `web/`: React + Vite frontend for registration/login, email verification, chat, profile editing, and admin document/user management.

The first registered user becomes an `admin`; later users are assigned the `user` role. Admins can upload supported documents, view platform statistics, delete uploaded documents, and block or unblock users. Regular users can create chats, ask questions, and receive streamed markdown responses grounded in the indexed document chunks.

## Tech Stack

### Backend

- Node.js, Express 5, TypeScript
- Sequelize ORM with PostgreSQL
- `pgvector` for vector embeddings and similarity search
- Google Gemini via `@google/genai`
  - `gemini-embedding-001` for embeddings
  - `gemini-2.5-flash-lite` for streamed answers
  - `gemini-2.5-flash` for generated chat titles
- AWS S3 for original document storage
- Multer memory uploads
- `pdf-parse`, `mammoth`, and `csv-parse` for document text extraction
- LangChain `RecursiveCharacterTextSplitter` for chunking
- JWT authentication, bcrypt password hashing, Zod validation
- Nodemailer for email verification

### Frontend

- React 19, TypeScript, Vite
- React Router
- TanStack Query
- Axios and `fetch` for API/SSE calls
- Tailwind CSS 4
- shadcn/Radix-style UI components
- Lucide icons
- React Markdown for assistant responses

## Features Implemented

- User registration, login, and JWT-protected routes
- Email verification flow through a mailed verification link
- First-user admin bootstrap
- Role-based access control for admin routes
- Profile editing with display name and password updates
- Gravatar-based user avatars
- Admin dashboard with document, chunk, user, and storage statistics
- Admin document upload for `.pdf`, `.docx`, `.txt`, and `.csv` files
- File preview before upload from the admin UI
- Document ingestion into S3, PostgreSQL metadata, and pgvector chunks
- Admin document table with uploader metadata and delete support
- Admin user table with pagination and block/unblock actions
- Chat creation, renaming, deletion, and infinite-scroll chat history sidebar
- User-scoped chat/message access
- Streaming assistant responses over Server-Sent Events
- Markdown rendering for assistant answers
- Automatic short chat title generation after the first user message
- Health endpoint at `/api/health`

## RAG Implementation

The Retrieval-Augmented Generation flow is implemented in the API:

1. An admin uploads a document through `POST /api/uploads`.
2. The file is uploaded to S3 and its text is extracted based on file type:
   - PDF: `pdf-parse`
   - DOCX: `mammoth`
   - TXT: UTF-8 buffer text
   - CSV: parsed rows converted into readable key/value text
3. Extracted text is split with LangChain's `RecursiveCharacterTextSplitter` using a chunk size of `500` and overlap of `200`.
4. Each chunk is embedded with Gemini `gemini-embedding-001`.
5. Document metadata is stored in `documents`; chunks and 3072-dimensional vectors are stored in `document_chunks.vector_embedding`.
6. When a user sends a chat message, the message is embedded with the same Gemini embedding model.
7. PostgreSQL/pgvector performs nearest-neighbor search using:

   ```sql
   ORDER BY "vector_embedding" <-> :embedding::vector
   LIMIT 5
   ```

8. The top 5 chunk texts are inserted into a strict grounding prompt that instructs the LLM to answer only from retrieved context.
9. The response is streamed back to the frontend as SSE chunks and saved as an `ai` message once complete.

This means answers are generated from the indexed document knowledge base rather than from the model's general knowledge. If retrieved context is missing or irrelevant, the prompt instructs the assistant to say it does not have enough information.

## Repository Structure

```text
.
|-- api/
|   |-- migrations/              # Sequelize migrations
|   |-- src/
|   |   |-- controllers/          # Request handlers
|   |   |-- middlewares/          # Auth, roles, multer, validation, errors
|   |   |-- models/               # Sequelize models and associations
|   |   |-- routes/               # API route definitions
|   |   |-- services/             # S3, document parsing, chunking, embeddings, LLM
|   |   |-- utils/                # API responses/errors, JWT, mail, prompts
|   |   |-- app.ts                # Express app wiring
|   |   |-- db.ts                 # Sequelize and pgvector setup
|   |   `-- server.ts             # API entrypoint
|   `-- package.json
|-- web/
|   |-- public/                   # Static assets
|   |-- src/
|   |   |-- components/           # Shared UI and app components
|   |   |-- pages/                # Route pages
|   |   |-- service/              # Axios client and API hooks
|   |   `-- main.tsx              # React entrypoint
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js 20+ recommended
- npm
- PostgreSQL with the `pgcrypto` and `vector` extensions available
- AWS S3 bucket and credentials
- Google Gemini API keys
- SMTP credentials for verification emails

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd document-intelligence-platform

cd api
npm install

cd ../web
npm install
```

### 2. Configure the API environment

From the repository root, create `api/.env` from `api/.env.sample`:

```bash
cd api
cp .env.sample .env
```

Fill in:

```env
PORT=8080
PGHOST=localhost
PGDATABASE=your_database
PGUSER=your_database_user
PGPASSWORD=your_database_password
PGSSLMODE=disable
PGCHANNELBINDING=
JWT_SECRET=replace-with-a-long-random-secret
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
GEMINI_API_KEY=your-gemini-embedding-key
GEMINI_API_KEY_PROMPT=your-gemini-generation-key
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_ACCESS_KEY_SECRET=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket
```

Notes:

- Use `PGSSLMODE=require` if your database requires SSL.
- `GEMINI_API_KEY` is used by the embedding service.
- `GEMINI_API_KEY_PROMPT` is used by the answer/title generation service.
- The current API CORS configuration allows the frontend at `http://localhost:5173`.

### 3. Configure the web environment

From the repository root, create `web/.env`:

```bash
cd web
touch .env
```

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Prepare the database

Create the PostgreSQL database, then run migrations from the API folder:

```bash
cd api
npx sequelize-cli db:migrate --config src/config/config.js --migrations-path migrations
```

The initial migration creates:

- `users`
- `documents`
- `document_chunks` with `vector(3072)`
- `chats`
- `chat_messages`

It also enables the `pgcrypto` and `vector` PostgreSQL extensions.

### Migration commands

Run these commands from the `api/` directory. This project keeps Sequelize config in `src/config/config.js` and migrations in `migrations/`, so include both flags when using `sequelize-cli`.

```bash
# Check migration status
npx sequelize-cli db:migrate:status --config src/config/config.js --migrations-path migrations

# Apply all pending migrations
npx sequelize-cli db:migrate --config src/config/config.js --migrations-path migrations

# Roll back the most recent migration
npx sequelize-cli db:migrate:undo --config src/config/config.js --migrations-path migrations

# Roll back all migrations
npx sequelize-cli db:migrate:undo:all --config src/config/config.js --migrations-path migrations

# Generate a new migration file
npx sequelize-cli migration:generate --name your-migration-name --migrations-path migrations
```

For a fresh local database, run `db:migrate` before starting the API. For an existing database, use `db:migrate:status` first to confirm which migrations are already applied.

### 5. Run the backend

```bash
cd api
npm run dev
```

By default, the API runs on `http://localhost:8080`.

### 6. Run the frontend

In a second terminal:

```bash
cd web
npm run dev
```

By default, Vite runs on `http://localhost:5173`.

### 7. Create the first admin user

Open `http://localhost:5173/register` and register a user. The first user in the database is assigned the `admin` role automatically. Verify the account using the email verification link, then sign in.

## Useful Scripts

### API

```bash
cd api
npm run dev      # start TypeScript dev server with tsx watch
npm run build    # compile TypeScript
npm run start    # run compiled dist/server.js
```

### Web

```bash
cd web
npm run dev      # start Vite dev server
npm run build    # TypeScript build + Vite production build
npm run lint     # run ESLint
npm run preview  # preview production build
```

## API Surface

All API routes are mounted under `/api`.

### Auth

- `POST /auth/register` - register a new user
- `POST /auth/login` - login and receive a JWT
- `GET /auth/me` - fetch current authenticated user
- `PATCH /auth/profile` - update name and optionally password
- `GET /auth/verify?token=...` - verify email address
- `GET /auth/users` - admin-only paginated user list
- `PATCH /auth/block/:userId` - admin-only block user
- `PATCH /auth/unblock/:userId` - admin-only unblock user

### Uploads and Admin Stats

- `POST /uploads` - admin-only document upload
- `GET /uploads/stats` - admin-only aggregate stats
- `GET /uploads/tableStats` - admin-only document table data
- `DELETE /uploads/:documentId` - admin-only delete document and chunks

### Chats and Messages

- `GET /chats` - paginated current-user chats
- `POST /chats` - create a chat
- `GET /chats/:chatId` - fetch one current-user chat
- `PATCH /chats/:chatId` - rename a chat
- `DELETE /chats/:chatId` - delete a chat
- `GET /messages/:chatId` - fetch messages for a current-user chat
- `POST /messages/:chatId` - send a message and stream the grounded answer

### Health

- `GET /health` - health check

## Document Upload Constraints

- Supported extensions: `.pdf`, `.docx`, `.txt`, `.csv`
- Maximum upload size: 50 MB
- Uploads are processed in memory before being stored in S3 and indexed
- Document deletion removes both the S3 object and stored database chunks

## Build Verification

Run both builds before shipping changes:

```bash
cd api
npm run build

cd ../web
npm run build
```

There is currently no implemented automated test suite; the API `test` script is still a placeholder.
