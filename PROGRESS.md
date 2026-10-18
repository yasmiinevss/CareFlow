# CareFlow — Progress Log

## Current status
Phase 1 — Backend skeleton done. Next: PostgreSQL.

## Session 2026-10-14

### Done
- Data model: `patients` and `appointments` tables, validation rules, status lifecycle (`docs/data-model.md`)
- API contract: 6 endpoints, unified error format, error codes (`docs/api.md`)
- Monorepo structure, `.gitignore`, README
- Express server: `app.js` / `server.js` split, `GET /api/health`
- Centralized error handling: `notFound` and `errorHandler` middlewares
- Configuration via environment variables (`.env`, `.env.example`, `src/config.js`)

### Technical decisions
- Separate `patients` table linked by `patient_id` (avoids duplicates, keeps history)
- Cancelling = status change, not deletion
- Final states: `cancelled`, `completed`, `no_show`
- `doctor_name` stored as text for the MVP
- Error format: `{ error: { code, message } }`; unexpected errors return a neutral 500
- Express 5, ES modules, `node --watch` (no nodemon), `--env-file` (no dotenv)
- Everything written in English

### Concepts learned
Primary/foreign keys, one-to-many relationships, REST resources and HTTP methods,
status codes, Express middleware chain, error propagation, secure error handling,
environment variables.

### Issues encountered
- Middlewares not registered in `app.js` (diagnosed via Express default HTML 404)
- `--env-file` declared as an npm script instead of a `node` option

### Next task
Run PostgreSQL in Docker, create tables, seed fictional data, connect Express.

### To do later
- Remove the `X-Powered-By` header (security)
- Filter appointments by patient: `GET /api/appointments?patient_id=7`

### Evening

#### Done
- PostgreSQL 17 running in Docker with a persistent volume (`careflow-pgdata`)
- `db/schema.sql` (tables, constraints, index) and `db/seed.sql` (fictional data)
- Connection pool (`pg`) with a startup check (fail fast)
- Layered architecture: routes → controllers → repositories
- `GET /api/appointments`, `GET /api/appointments/:id`
- `GET /api/patients`, `GET /api/patients/:id`
- `AppError` class for expected errors (400, 404)

#### Technical decisions
- Constraints enforced in the database too (defense in depth)
- "Must be in the future" is a business rule, validated in the backend only
- Parameterized queries only (`$1`), never string concatenation (SQL injection)
- Explicit column lists instead of `SELECT *`
- Controllers never build error responses: they throw `AppError`
- Pinned Docker image version (`postgres:17`)

#### Concepts learned
Docker images, containers, port mapping and volumes, PostgreSQL types and
constraints, indexes, JOIN, connection pool, layered architecture,
SQL injection, class inheritance (`extends Error`).

#### Next task
`POST /api/appointments` with full validation, then `PATCH` with status transitions
(introduce a service layer for business rules).

#### To do later
- Document `GET /patients/:id` in `docs/api.md`
- Remove the `X-Powered-By` header
- Filter appointments by patient: `GET /api/appointments?patient_id=7`

### Late evening

#### Done
- `POST /api/patients`, `POST /api/appointments`, `PATCH /api/appointments/:id`
- Validators (`validators/`): shape of incoming data, shared `checkName` in `common.js`
- Service layer (`services/`): patient existence check, status transitions
- All MVP endpoints implemented

#### Technical decisions
- Validators are pure functions returning clean data (unknown fields dropped)
- Business rules live in services, which may call several repositories
- Status transitions defined in an `ALLOWED_TRANSITIONS` map (409 if not allowed)
- Dynamic UPDATE: column names come only from a whitelist, values stay parameterized
- Named exports for files exporting several functions

#### Issues encountered
- Two default imports from the same file silently returned the same function
- Old controller code using camelCase field names instead of the API contract

#### Next session
1. Cleanup: rename `utills` → `utils`, check error `code` values, remove `X-Powered-By`,
   document `GET /patients/:id` in `docs/api.md`
2. Automated tests (validators, then API endpoints)
3. Start the React frontend

## Session 2026-10-15

### Done
- Cleanup: `utils` folder, error codes as strings, `X-Powered-By` disabled
- Unit tests (`node:test`): validators and status transition rules
- Integration tests (`supertest`): PATCH endpoint against a real database
- Status rules extracted into a pure function (`appointmentRules.js`)
- Backend Dockerfile and `.dockerignore`; backend runs in a container

### Technical decisions
- Built-in test runner (`node:test`), `supertest` as a dev dependency
- Database reset before each integration test (test isolation)
- Docker image: `node:24-alpine`, `npm ci --omit=dev`, non-root user, no secrets in the image
- All application code in `src/`; `db/` only contains SQL scripts

### Issues encountered
- `pg` installed in the wrong folder: worked locally, failed in Docker
- Duplicate `config.js` outside `src/`: also revealed by Docker
- Default import vs `import * as` for repositories

### Next session
Docker Compose: backend + PostgreSQL on a shared network, automatic database
initialization, healthchecks.

## Session 2026-10-18

### Done
- `compose.yaml`: backend + PostgreSQL on a private network, persistent volume
- Healthchecks (`pg_isready`, `/api/health`), startup order with `service_healthy`
- Automatic database initialization (`/docker-entrypoint-initdb.d`)

### Issues encountered
- `Resource deadlock avoided`: project in iCloud-synced `Documents`, files were `dataless`.
  Moved the project to `~/Projects`.

### Next session
CI with GitHub Actions: run tests against a temporary PostgreSQL, build the Docker image.

