
Este proyecto es la solución del plan de mejoramiento del aprendiz A15, ficha 3239137, dominio plans-archive

# Plans Archive

## Project Overview

Plans Archive is a web-based engineering drawing management system designed to manage drawing inventory, engineers, loans, returns, and operational reports.

## Technology Stack

- Frontend: React and Vite.
- Backend: PHP 8.4 and Laravel 12.
- Database: PostgreSQL 17.
- Infrastructure: Docker and Docker Compose.
- Authentication: Laravel Sanctum.
- Data seeding: Node.js.

## Core Features

- Authentication and role-based authorization.
- Engineering drawing catalog management.
- Engineer management.
- Loan and return management.
- Inventory availability control.
- Overdue loan validation.
- Historical loan snapshots.
- Concurrent loan protection.
- Most requested drawings report.

## Business Rules

- Each engineer can have a maximum of three open loans.
- The loan period is six days.
- Engineers with overdue loans cannot request new loans.
- Available units must remain between zero and total units.
- Historical loan information must remain unchanged.
- Catalog records use logical deactivation.
- Loan and return records must not be deleted.
- Dates are handled in UTC.
- User-facing messages are written in Spanish.

## Project Structure

| Directory | Responsibility |
|-----------|----------------|
| docs/ | Technical specifications and architecture decisions |
| api/ | Laravel REST API and backend tests |
| app/ | React web application |
| infra/ | Docker infrastructure and service configuration |
| page/ | Public product website |
| tool/ | API-based data seeding tool |

## Prerequisites

- Docker Desktop.
- Docker Compose.
- Node.js and npm for local tool execution.
- Git.

Configure the required environment variables and persistent database volume according to the infrastructure documentation before starting a new installation.

## Running the Project

From the project root:

```bash
cd infra
docker compose up -d
```

Check the service status:

```bash
docker compose ps
```

## Local Services

| Service | Address |
|---------|---------|
| React application | http://localhost:5173 |
| Laravel API | http://localhost:8000/api/v1 |
| PostgreSQL | localhost:5434 |
| Public website | page/index.html |

## Security

- Services are restricted to the local host.
- Laravel debug mode is disabled.
- Protected endpoints require authentication.
- Administrative operations require authorized roles.
- Environment secrets are excluded from version control.
- The main database is separated from the testing database.

## Testing and Validation

Previously recorded automated test results:

- Backend: 29 passed tests and 65 assertions.
- Data seeding tool: 36 passed tests.
- React application: successful production build.

Parallel loan scenario verified on November 26, 2026:

- Initial available units: 1.
- Successful loans: 1.
- Rejected loans: 1.
- Final available units: 0.
- Final loan count: 1.

The rejected request produced the expected inventory business rule exception.

Backend tests must run against the isolated PostgreSQL testing database, never against the main application database.

## Demonstration Dataset

The main application database was verified with:

- 5 categories.
- 10 engineers.
- 25 engineering drawings.
- 15 loans.
- 5 returns.
- 75 total units.
- 65 available units.

The data seeding tool communicates with the REST API instead of inserting records directly into the database.

## Technical Documentation

- ARCHITECTURE.md
- DESIGN.md
- REQUIREMENTS.md
- TESTING.md
- docs/

Each component contains its corresponding implementation and technical documentation.

## Academic Context

- Institution: SENA.
- Training program: Software Analysis and Development.
- Training group: 3239137.
- Learner code: A15.
- Assigned domain: plans-archive.
