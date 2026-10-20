# CareFlow

Appointment management API for a fictional medical practice, built as a portfolio project to practice full-stack development, containerization, CI/CD and cloud deployment.

> **Fictional data only.** CareFlow is a learning project, not a real medical application.

## Project status

🚧 **In progress**

| Area | Status |
|---|---|
| REST API (Node.js / Express) | ✅ Done |
| PostgreSQL database (schema, constraints, seed data) | ✅ Done |
| Unit and integration tests | ✅ Done |
| Backend Docker image | ✅ Done |
| Docker Compose (backend + database) | 🔜 Next |
| CI with GitHub Actions | 🔜 Planned |
| Deployment on AWS (EC2, VPC, IAM, CloudWatch) | 🔜 Planned |
| React frontend | 🔜 Planned |

## Features

- List, view, create and update appointments
- Cancel an appointment by changing its status (no deletion, history is kept)
- Status lifecycle with enforced transitions: `scheduled` → `cancelled` / `completed` / `no_show`
- Create and list patients
- Input validation and a consistent JSON error format

## Tech stack

- **Backend:** Node.js 24, Express 5
- **Database:** PostgreSQL 17
- **Tests:** Node.js built-in test runner (`node:test`), `supertest`
- **Containers:** Docker
- **Planned:** Docker Compose, GitHub Actions, AWS, React

## Architecture

The backend follows a layered architecture. Each layer has a single responsibility:

```
HTTP request
   │
   ▼
routes/        maps each URL to a controller function
   ▼
controllers/   handles HTTP: reads the request, sends the response
   ▼
validators/    checks the shape of incoming data (types, lengths, allowed values)
   ▼
services/      applies business rules (patient must exist, status transitions)
   ▼
repositories/  runs SQL queries (parameterized only)
   ▼
PostgreSQL
```

All errors go through a central error-handling middleware that returns a single JSON format:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "duration_minutes must be an integer between 15 and 30" } }
```

Unexpected errors are logged on the server and return a neutral `500` message, so internal details are never exposed.

## Getting started

### Prerequisites

- Node.js 24
- Docker

### 1. Start PostgreSQL

```bash
docker run --name careflow-db \
  -e POSTGRES_USER=careflow \
  -e POSTGRES_PASSWORD=careflow_dev_password \
  -e POSTGRES_DB=careflow \
  -p 5432:5432 \
  -v careflow-pgdata:/var/lib/postgresql/data \
  -d postgres:17
```

### 2. Configure the environment

```bash
cd backend
cp .env.example .env
```

Then edit `.env` and set `DB_PASSWORD` to the password used above.

### 3. Create the tables and load the sample data

```bash
docker exec -i careflow-db psql -U careflow -d careflow < db/schema.sql
docker exec -i careflow-db psql -U careflow -d careflow < db/seed.sql
```

### 4. Install and run

```bash
npm install
npm run dev
```

The API is available at `http://localhost:3000/api`. Health check:

```bash
curl http://localhost:3000/api/health
```

### 5. Run the tests

```bash
npm test
```

> The integration tests reset the database before each test.

## API overview

| Method | URL | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/appointments` | List all appointments |
| GET | `/api/appointments/:id` | Get one appointment |
| POST | `/api/appointments` | Create an appointment |
| PATCH | `/api/appointments/:id` | Update an appointment (date, duration, status) |
| GET | `/api/patients` | List all patients |
| GET | `/api/patients/:id` | Get one patient |
| POST | `/api/patients` | Create a patient |

Full reference: [`docs/api.md`](docs/api.md) · Data model: [`docs/data-model.md`](docs/data-model.md)

## Key design decisions

- **Cancelling is a status change, not a deletion**, to keep a full history (e.g. tracking no-shows).
- **Business rules are separated from data access**: status transition rules live in a pure function, unit-tested on every combination.
- **Defense in depth**: data is validated in the backend *and* protected by database constraints (`CHECK`, `NOT NULL`, foreign keys).
- **Parameterized SQL queries only**, to prevent SQL injection.
- **No secrets in the code, the Git history or the Docker image**: configuration comes from environment variables.
- **Docker image**: pinned Node version, production dependencies only, runs as a non-root user.

## Project structure

```
backend/
├── db/              SQL scripts (schema, seed data)
├── src/
│   ├── config.js    configuration from environment variables
│   ├── app.js       Express app (middlewares and routes)
│   ├── server.js    starts the server after checking the database connection
│   ├── db/          PostgreSQL connection pool
│   ├── routes/
│   ├── controllers/
│   ├── validators/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/ 404 and error handling
│   └── utils/       AppError class
├── tests/           unit and integration tests
└── Dockerfile
docs/                API reference and data model
```

## Roadmap

1. Docker Compose (backend + PostgreSQL, healthchecks)
2. CI with GitHub Actions (tests against a temporary PostgreSQL, Docker build)
3. AWS deployment: IAM, VPC, Security Groups, EC2, CloudWatch
4. Minimal React frontend served by Nginx
5. Continuous deployment

### CI (2026-10-18)

#### Done
- `.github/workflows/ci.yaml`: `test` job (PostgreSQL 17 service container, npm ci, npm test)
  then `build` job (docker build), only if tests pass (`needs: test`)
- Verified: a deliberately broken rule makes the pipeline fail and skips the build

#### Issues encountered
- Push refused: Personal Access Token without `workflow` scope.
  Replaced with a fine-grained token limited to this repository.

#### Next session
AWS foundations: IAM user with MFA, budget alert, VPC and Security Groups, costs.