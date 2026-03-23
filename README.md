# MockPrepAI

MockPrepAI is an AI-powered interview practice platform that helps candidates simulate realistic interviews and improve with structured feedback.

Users can create accounts, set up interviews, answer AI-generated questions (including follow-ups), and review post-interview reports with performance insights.

## Product Highlights

- Audio-first mock interview experience.
- AI-generated domain-specific interview questions and follow-ups.
- Real-time interview flow with question/answer progression.
- Structured feedback reports with strengths and weaknesses.
- Interview history to track improvement over time.
- Resume upload support with local or S3-backed storage.

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- React Router
- React Query
- Zustand
- Tailwind CSS

### Backend

- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- AWS SDK (optional S3 storage)

## Monorepo Structure

- `frontend/`: React web app
- `backend/`: NestJS API server
- `docker/`: Docker and Compose setup
- `shared/`: shared resources (if added later)

## Getting Started (Local Development)

## 1) Prerequisites

- Node.js 20+ recommended
- npm
- PostgreSQL running locally (or via Docker)

## 2) Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 3) Configure environment variables

Create a `.env` file inside `backend/` with at least:

```env
DATABASE_URL=postgres://mockprepai:mockprepai@localhost:5432/mockprepai
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Resume storage
STORAGE_DRIVER=local
UPLOADS_DIR=uploads
BACKEND_ORIGIN=http://localhost:3000

# Optional S3 settings (required only when STORAGE_DRIVER=s3)
AWS_REGION=
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
```

## 4) Run database migrations

From `backend/`:

```bash
npx prisma migrate dev
```

## 5) Start the apps

In one terminal:

```bash
cd backend
npm run start:dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

## Run with Docker

From project root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Default ports:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Core Backend Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

Interview (JWT-protected):

- `POST /api/interview/start`
- `GET /api/interview/question?interviewId=...`
- `POST /api/interview/answer?interviewId=...&questionId=...`
- `POST /api/interview/end`
- `GET /api/interview/report/:id`
- `GET /api/interview/history`

## Notes

- Uploaded files are served from `/uploads` in local mode.
- If using S3 storage, set `STORAGE_DRIVER=s3` and provide valid AWS/S3 variables.

