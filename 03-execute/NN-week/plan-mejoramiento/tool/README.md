# Plans Archive - API Data Seeder

## 1. Overview

The Plans Archive Data Seeder is a command-line tool
designed to populate a local demonstration environment
through the existing Laravel REST API.

The tool generates deterministic fictional records,
respects backend business rules, and never connects
directly to the PostgreSQL database.

## 2. Objectives

- Populate the application with demonstration data.
- Validate REST API communication.
- Generate engineering drawing records.
- Simulate loan and return operations.
- Prevent duplicate demonstration records.
- Protect existing catalog and historical information.
- Support automated testing and application demonstrations.

## 3. Technologies

| Technology | Purpose |
|---|---|
| Node.js | Command-line execution |
| JavaScript | Application logic |
| Native Fetch API | HTTP communication |
| Node.js Test Runner | Automated testing |
| Laravel REST API | Backend integration |
| PostgreSQL | Backend data persistence |

The tool does not require external npm dependencies.

## 4. Requirements

- Node.js 22.9.0 or later.
- npm available in the local environment.
- Running Laravel REST API.
- Existing engineering drawing categories.
- Valid administrator bearer token.
- Dedicated local demonstration database.

Default API endpoint:

`http://localhost:8000/api/v1`

Do not execute this tool against production data.

## 5. Project Structure

```text
tool/
├── src/
│   ├── config.js
│   ├── api-client.js
│   ├── fixtures.js
│   ├── seeder.js
│   └── index.js
├── tests/
│   ├── api-client.test.js
│   ├── fixtures.test.js
│   └── seeder.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Source Components

| File | Responsibility |
|---|---|
| config.js | Environment configuration and validation |
| api-client.js | Authenticated HTTP requests |
| fixtures.js | Deterministic demonstration records |
| seeder.js | Data validation and creation workflow |
| index.js | Command-line application entry point |

### Test Components

| File | Responsibility |
|---|---|
| api-client.test.js | API client and configuration tests |
| fixtures.test.js | Domain data and business rule tests |
| seeder.test.js | Data seeding workflow tests |

## 6. Environment Configuration

Open a PowerShell terminal inside the `tool/` directory.

Verify the installed Node.js and npm versions:

```powershell
node --version
npm --version
```

Create the local environment configuration if it
does not already exist:

```powershell
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Configure the following environment variables:

```dotenv
API_BASE_URL=http://localhost:8000/api/v1
API_TOKEN=
```

### Environment Variables

| Variable | Description |
|---|---|
| API_BASE_URL | Local Laravel REST API base URL |
| API_TOKEN | Administrator authentication token |

Obtain a valid administrator token through the
existing authentication endpoint.

Never commit real authentication credentials.

## 7. Available Commands

| Command | Description |
|---|---|
| npm test | Run all automated tests |
| npm run test:watch | Run tests in watch mode |
| npm run test:coverage | Display code coverage statistics |
| npm run seed | Execute the default preview |
| npm run seed:preview | Execute a read-only preview |
| npm run seed:apply | Execute the actual data creation |

## 8. Automated Testing

Run the complete test suite:

```powershell
npm test
```

Run tests with coverage statistics:

```powershell
npm run test:coverage
```

### Test Distribution

| Test File | Test Cases |
|---|---:|
| api-client.test.js | 12 |
| fixtures.test.js | 11 |
| seeder.test.js | 12 |
| Total | 35 |

### Test Coverage Areas

- Authentication headers.
- HTTP response validation.
- Network error handling.
- JSON response validation.
- Pagination handling.
- Local API configuration.
- Resource identifier validation.
- Fixture uniqueness.
- Engineering category distribution.
- Loan and inventory constraints.
- Duplicate record prevention.
- Preview mode protection.
- Partial failure handling.
- Resource relationships.

Automated tests use simulated API responses.

They do not modify the database or require a running
Laravel application.

Live integration must be verified separately.

## 9. Execution Modes

### 9.1 Preview Mode

Preview mode is enabled by default.

```powershell
npm run seed:preview
```

This mode performs read-only API requests, validates
existing records, and displays the expected dataset.

No records are created.

### 9.2 Apply Mode

Apply mode explicitly authorizes data creation.

Only execute this command after confirming that the
target database is intended for demonstration.

```powershell
npm run seed:apply
```

Alternatively:

```powershell
npm run seed -- --apply
```

The tool sends authenticated POST requests to Laravel.

All persistence and business validation are handled
by the backend application.

## 10. Demonstration Dataset

| Resource | Quantity |
|---|---:|
| Existing categories | 5 |
| Fictional engineers | 10 |
| Engineering drawings | 25 |
| Initial inventory units | 75 |
| Loans | 15 |
| Returns | 5 |
| Remaining open loans | 10 |
| Remaining available units | 65 |

These quantities represent the expected result of a
successful first execution with new demonstration
records.

### Engineering Categories

| Category | Code | Plans |
|---|---|---:|
| Architectural | ARQ | 5 |
| Structural | EST | 5 |
| Electrical | ELE | 5 |
| Hydraulic | HID | 5 |
| Road | VIA | 5 |

The tool resolves existing categories instead of
creating duplicate category records.

## 11. API Integration

All API requests use JSON and bearer authentication.

### Read Operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /categories | Retrieve existing categories |
| GET | /engineers | Validate existing engineers |
| GET | /plans | Retrieve active drawings |
| GET | /plans?include_inactive=true | Check inactive drawings |

### Write Operations

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /engineers | Create fictional engineers |
| POST | /plans | Create engineering drawings |
| POST | /loans | Register loans |
| POST | /loans/{id}/returns | Register returns |

The endpoints are relative to the configured API base URL.

Administrator permissions are required for the
complete seeding workflow.

Endpoint filters and response formats must be
verified against the running Laravel API.

## 12. Execution Workflow

```text
Start
  |
Load environment configuration
  |
Initialize authenticated API client
  |
Retrieve existing categories
  |
Validate existing catalog records
  |
Check duplicate demonstration records
  |
Generate execution summary
  |
Is apply mode enabled?
  |
  +-- No  --> Display preview --> Finish
  |
  +-- Yes --> Create engineers
                |
              Create plans
                |
              Register loans
                |
              Register returns
                |
              Display summary
                |
              Finish
```

## 13. Business Rules

The demonstration dataset is designed to respect:

- A maximum of three simultaneous open loans
  per engineer.
- Valid engineering drawing references.
- Valid engineer references.
- Non-negative available inventory.
- Available inventory below or equal to total inventory.
- Unique demonstration codes.
- Valid loan and return relationships.
- Preservation of historical operations.

Loan dates, due dates, overdue restrictions,
inventory transactions, and concurrency control
remain the responsibility of Laravel.

The tool does not generate artificial overdue dates.

## 14. Security and Data Protection

The tool implements the following protections:

- Local API hosts only.
- Mandatory authentication token.
- HTTP redirect rejection.
- Request timeout of fifteen seconds.
- Read-only preview by default.
- Explicit authorization for data creation.
- Duplicate demonstration record detection.
- Sequential API requests.
- No direct database connections.
- No automatic record updates or deletions.

Never execute multiple seeding processes concurrently.

## 15. Error Handling and Recovery

The execution stops when an unexpected API or
validation error occurs.

Previous successful HTTP operations are not
automatically rolled back.

A failed execution may leave partial demonstration
records in the database.

If this occurs:

1. Stop the execution.
2. Review the reported error.
3. Inspect existing demonstration records.
4. Verify backend application logs.
5. Resolve the underlying problem.
6. Review the database before attempting another run.

Do not automatically delete historical records.

The tool intentionally rejects repeated executions
when existing demonstration records are detected.

## 16. Verification Checklist

After an authorized successful execution, verify:

- [ ] The five required categories are available.
- [ ] Ten fictional engineers have been created.
- [ ] Twenty-five drawings have been created.
- [ ] Fifteen loans have been registered.
- [ ] Five returns have been registered.
- [ ] Ten demonstration loans remain open.
- [ ] Sixty-five demonstration units remain available.
- [ ] Inventory quantities are consistent.
- [ ] Historical records remain protected.
- [ ] The most requested plans report displays data.
- [ ] All automated tests pass.

## 17. Git Version Control

Do not commit:

- Authentication tokens.
- Local .env files.
- node_modules directories.
- Generated coverage reports.
- Temporary files.
- Application logs.

Use separate commits for configuration,
API communication, fixtures, workflow,
automated tests, and documentation.

## 18. Project Integration

The data seeding tool is part of the
Plans Archive software project.

| Directory | Responsibility |
|---|---|
| docs/ | Technical documentation |
| api/ | Laravel REST API |
| app/ | React application |
| infra/ | Docker infrastructure |
| page/ | Public product website |
| tool/ | API data seeding tool |

The tool communicates exclusively with the
backend REST API.

## 19. Conclusion

The Plans Archive Data Seeder provides a controlled,
reproducible, and testable mechanism for generating
demonstration data.

Its modular architecture supports maintainability,
data protection, automated testing, and integration
with the existing software system.