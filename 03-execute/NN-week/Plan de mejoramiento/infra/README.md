# Plans Archive — Infrastructure

This directory contains the local Docker Compose environment for the existing Plans Archive application. It provides PostgreSQL, the Laravel REST API, and the React/Vite frontend without duplicating application source code.

## Repository layout

The Compose configuration assumes the following existing paths relative to `infra/`:

```text
Plan de mejoramiento/
├── api/api/                 # Existing Laravel project
├── app/                     # Existing React/Vite project
└── infra/
    ├── compose.yaml
    ├── .env.example
    ├── .gitignore
    └── docker/
        ├── backend/Dockerfile
        └── frontend/Dockerfile
```

## Requirements

- Docker Desktop with Docker Compose v2
- Available local ports: 5173, 8000, and 5434 (or change them in `.env`)
- An existing Laravel project at `../api/api` and React/Vite project at `../app`

## First-time setup (PowerShell)

From the `infra` directory:

```powershell
Copy-Item .env.example .env
# Edit .env and replace the example PostgreSQL password.
docker compose -f compose.yaml config
docker compose -f compose.yaml up -d --build
```

If the Laravel application has no application key, generate one once:

```powershell
docker compose exec api php artisan key:generate
```

Apply database migrations only after checking the configured database:

```powershell
docker compose exec api php artisan migrate
```

Use `docker compose exec api php artisan db:seed` only when seed data is required and safe for the selected database.

## Endpoints

| Service | Local URL / port |
| --- | --- |
| React/Vite | http://localhost:5173 |
| Laravel API | http://localhost:8000 |
| PostgreSQL | localhost:5434 (container port 5432) |

The frontend uses `API_PROXY_TARGET=http://api:8000` to forward API requests from Vite to Laravel inside the Docker network. Laravel application secrets and authentication settings remain the responsibility of the existing Laravel `.env` configuration.

## Verification

```powershell
docker compose ps
docker compose exec api php artisan test
docker compose exec app npm run build
```

## Stop services

```powershell
docker compose down
```

Do not run `docker compose down -v` unless you intentionally want to delete database and dependency volumes.

## Integration notes

- **Existing containers:** If Plans Archive is already running in Docker on ports 5173, 8000, and 5434, stop that stack before starting this alternative Compose project. Do not run both at the same time.
- **Existing Laravel `.env`:** Docker Compose passes PostgreSQL settings to the API container. Confirm that the application is using those container environment variables, especially if `config:cache` was previously run. Use `docker compose exec api php artisan config:clear` when appropriate.
- **Persistence:** PostgreSQL uses the existing external Docker volume `plans_archive_pgdata`. Never run two PostgreSQL servers against this volume simultaneously. Application source files are mounted from the existing project folders.
- **Security:** Do not commit `infra/.env`, Laravel `.env`, credentials, database exports, or generated secrets. `.env.example` is documentation only.
- **Development use:** This Compose stack uses the Laravel development server and Vite development server. It is not a production deployment configuration.
- **Existing project:** The provided files are a separate infrastructure option and have not been tested against the user's running Windows Docker containers. Review them before replacing any working infrastructure configuration.
