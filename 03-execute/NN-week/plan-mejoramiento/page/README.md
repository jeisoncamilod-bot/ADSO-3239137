
# Plans Archive - Public Product Website

## Overview

Plans Archive is a software solution designed to manage
physical engineering drawings in engineering offices.

This directory contains the static public website that
presents the product, its capabilities, operational
workflow, and business rules.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- SVG graphics

No external dependencies or build tools are required.

## Directory Structure

```text
page/
├── assets/
│   ├── blueprint.svg
│   └── mark.svg
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── index.html
└── README.md
```

## Product Features

- Engineering drawing catalog.
- Inventory and availability management.
- Engineer management.
- Loan and return registration.
- Overdue loan tracking.
- Historical operation records.
- Most requested drawings report.

## Business Rules

- Maximum of three open loans per engineer.
- Six-day loan period.
- Engineers with overdue loans cannot receive new loans.
- Available units must remain within inventory limits.
- Historical loan information must remain unchanged.
- Loans and returns must not be physically deleted.
- Concurrent requests for the last available unit must
  be handled consistently by the backend.

## Running Locally

Open `index.html` directly in a web browser.

No package installation, database connection, API
connection, or build process is required.

Alternatively, if Python is installed, execute the
following command from the `page/` directory:

```bash
python -m http.server 8080
```

Open the website at:

http://localhost:8080

## Application Integration

The application access link points to:

http://localhost:5173/

This address matches the existing local React environment.

The React service must be running before accessing
the operational application.

For public deployment, replace the local address
with the deployed application URL.

The illustrated catalog does not contain live data.

## Accessibility and Responsive Design

- Semantic HTML structure.
- Responsive desktop and mobile layouts.
- Keyboard navigation.
- Visible focus indicators.
- Accessible mobile navigation.
- Alternative text for meaningful images.
- Local vector graphics.

## Verification

- [ ] Verify desktop and mobile layouts.
- [ ] Verify internal navigation links.
- [ ] Verify mobile menu behavior.
- [ ] Verify keyboard accessibility.
- [ ] Verify FAQ controls.
- [ ] Verify stylesheet and SVG resources.
- [ ] Verify React application access.
- [ ] Verify consistency with the project specification.

## Project Integration

- `../docs/` - Technical documentation.
- `../api/` - Laravel REST API.
- `../app/` - React frontend application.
- `../infra/` - Docker infrastructure.
- `../tool/` - Required API data seeding tool.

## Scope

This website is a static product presentation layer.

Operational functionality remains within the React
application and Laravel REST API.

This directory does not modify the database,
backend, frontend, or Docker infrastructure.

No additional operational business features are
introduced outside the project specification.

Public hosting is not included.
