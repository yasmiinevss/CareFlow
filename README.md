# CareFlow

Full-stack appointment management application for a fictional medical practice, built end to end as a portfolio project: from design to automated deployment on AWS.

> **Fictional data only.** CareFlow is a learning project, not a real medical application.

## Features

- List, create and cancel appointments from a React interface
- Cancelling is a **status change, never a deletion**, to keep the history
- Status lifecycle with enforced transitions: `scheduled` → `cancelled` / `completed` / `no_show`
- Attendance statistics per patient (`GET /api/patients/:id/stats`), developed with **TDD**
- Input validation and a single JSON error format

## Architecture

```
Browser (React + TypeScript)
   │  HTTP / JSON, relative /api/... URLs
   ▼
Nginx ─────────── serves the built frontend, forwards /api to the backend (only exposed service)
   ▼
Backend (Node.js + Express), layered:
   routes → controllers → validators → services → repositories
   ▼
PostgreSQL (constraints, foreign keys, parameterized queries only)
```

**Deployment:** Docker Compose on an AWS EC2 instance (Graviton, Paris region).
A push on `main` runs a GitHub Actions pipeline:

1. **test** – unit and integration tests against a temporary PostgreSQL
2. **build** – builds the backend and frontend images (ARM), tags them with the commit SHA, pushes them to Amazon ECR
3. **deploy** – sends a command through AWS Systems Manager; the instance pulls the new images and restarts the containers

No AWS key is stored anywhere: GitHub authenticates with **OIDC**, and the instance uses an **IAM role**. No SSH port is open.

## Tech stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js 24, Express 5 |
| Database | PostgreSQL 17 |
| Tests | `node:test`, `supertest` |
| Containers | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |
| Cloud | AWS: EC2, ECR, IAM, Systems Manager, CloudWatch Logs |

## Run locally

**Prerequisites:** Docker, Node.js 24.

```bash
cp .env.example .env              # then set DB_PASSWORD
docker compose up -d --build
```

- Application: http://localhost
- API health check: http://localhost/api/health

### Frontend in development mode

```bash
docker compose up -d careflow-db
cd backend && npm install && npm run dev      # API on port 3000
cd frontend && npm install && npm run dev     # http://localhost:5173 (Vite proxies /api to the backend)
```

## Run the tests

```bash
docker compose up -d careflow-db
cd backend
npm test
```

Integration tests reset the database before each test and run one file at a time, so they never interfere with each other.

## API overview

| Method | URL | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/:id` | Get one appointment |
| POST | `/api/appointments` | Create an appointment |
| PATCH | `/api/appointments/:id` | Update an appointment (date, duration, status) |
| GET | `/api/patients` | List patients |
| GET | `/api/patients/:id` | Get one patient |
| POST | `/api/patients` | Create a patient |
| GET | `/api/patients/:id/stats` | Appointment counters for a patient |

Full contract: [`docs/api.md`](docs/api.md) · Data model: [`docs/data-model.md`](docs/data-model.md)

## Deployment and rollback

Deployment is automatic on every push to `main`. To roll back, redeploy a previous version from the server:

```bash
sudo IMAGE_TAG=<previous-commit-sha> ./scripts/deploy.sh
```

Image tags are immutable in ECR, so a tag always points to the exact image that was tested.

## Key design decisions

- **Layered backend**: one responsibility per layer; only repositories contain SQL.
- **Defense in depth**: validation in the backend *and* constraints in the database.
- **Raw counters instead of a rate** for patient statistics: a percentage is misleading on few appointments.
- **Counting done by PostgreSQL** (`COUNT … FILTER`): one row returned, whatever the volume.
- **No secrets** in the code, the Git history or the Docker images.

## Known limitations and next steps

- HTTPS and a domain name
- Database backups (`pg_dump` to S3, or Amazon RDS)
- CloudWatch alarms (disk, memory)
- Clean old images on the server after each deployment
