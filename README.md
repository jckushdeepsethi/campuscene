# CampuScene

The scene of every event at the campus. Campus event management platform for students, societies, placement teams, and admins.

CampuScene is being built module by module as a public software engineering journey.

## Current Status

Milestone 12: End-to-End (E2E) Automated Integration Suite & Final Production Polish is implemented.

Completed:

- Programmatic E2E Full-Lifecycle Integration Suite (`backend/tests/e2e.flow.test.ts`): Programmatically validates multi-role user flows from registration, event drafting, admin approval, waitlist queueing, cancellation with auto-promotion, CSV attendee export, attendance check-ins, to live analytics.
- Backend authentication API with registration, login, refresh token rotation, logout, email verification, forgot password, reset password, and current-user lookup.
- Event Management Backend REST API with event CRUD, student registrations, admin approval workflow, attendance check-in, registration cancellation, attendee CSV export, and live event analytics.
- Docker Containerization & Orchestration (`docker-compose.yml`): Orchestrates PostgreSQL 16, multi-stage Express API backend, and Nginx Alpine frontend web server.
- Real-time Event Analytics API (`GET /api/v1/events/analytics`): Aggregates event status distribution counts, registration check-in conversion rates, and capacity fill leaderboards.
- Frontend Interactive Analytics Widget (`EventAnalyticsWidget`): Displays check-in conversion rate progress rings, status distribution cards, and high-demand events leaderboards on `/dashboard`.
- Automatic Waitlist Promotion Engine (`cancelRegistration`): Automatically promotes the earliest waitlisted student (`createdAt ASC`) when an active registration is cancelled.
- Organizer Attendee CSV Export (`GET /api/v1/events/:id/export`): Downloads formatted CSV files containing student attendee details and check-in timestamps.
- Email Delivery Service (`EmailService`) rendering HTML verification and password reset links.
- Interactive OpenAPI 3.0 Swagger UI documentation explorer mounted at `http://localhost:4000/api/v1/docs`.
- Frontend Event Discovery feed (`/events`), Event Creation workspace (`/events/new`), and Event Detail & Attendance workspace (`/events/:id`) with Cancel Registration and Export CSV buttons.
- Connected live backend event statistics and active navigation on the protected dashboard (`/dashboard`).
- Automated Frontend Test Suite using Vitest, React Testing Library, and jsdom (5 test files, 9 passing tests).
- Automated Backend Test Suite with 41 passing tests covering auth & event services, E2E full-lifecycle workflows, analytics aggregation, email dispatch, waitlist promotion, CSV export, validators, middleware, crypto helpers, and JWT helpers.
- Total Full-Stack Automated Tests: **50 passing tests (41 backend + 9 frontend)**.
- Full architecture and milestone documentation.

## Docker Containerized Launch

Run the entire full-stack application (PostgreSQL + Express + Nginx/Vite) with Docker Compose:

```bash
# Launch database, backend API, and Nginx frontend in containerized environment
docker compose up --build
```

* **Frontend Web App**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:4000`
* **Interactive OpenAPI Swagger Docs**: `http://localhost:4000/api/v1/docs`

## Interactive API Documentation

Run the backend server (`npm run dev` in `backend/`) and open:
* **`http://localhost:4000/api/v1/docs`** to explore interactive Swagger UI documentation for all endpoints.

## Screenshots

Add screenshots after running the app locally:

- Login page: `docs/screenshots/milestone-01-login.png`
- Registration page: `docs/screenshots/milestone-01-register.png`
- Protected dashboard: `docs/screenshots/milestone-04-dashboard.png`
- Event Feed page: `docs/screenshots/milestone-06-event-feed.png`
- Create Event page: `docs/screenshots/milestone-06-create-event.png`
- Event Detail & Check-in page: `docs/screenshots/milestone-06-event-detail.png`
- Swagger UI API Docs: `docs/screenshots/milestone-08-swagger-docs.png`

## Tech Stack

Backend:

- Node.js
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod
- Swagger UI Express & OpenAPI 3.0
- Helmet, CORS, compression, Morgan, cookie-parser

Frontend:

- React 19
- TypeScript
- Vite
- Vitest & React Testing Library (Automated Testing)
- Nginx (Production Static Web Server & Proxy)
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- lucide-react
- Framer Motion

Containerization:

- Docker & Docker Compose
- Multi-stage Alpine builds

## Project Structure

```text
backend/
  prisma/
    schema.prisma
  src/
    config/
      openapi.yaml
    controllers/
    dtos/
    errors/
    middleware/
    repositories/
    routes/
    services/
    types/
    utils/
    validators/
  tests/
  Dockerfile
  .dockerignore

frontend/
  src/
    app/
    components/
    features/
      auth/
      dashboard/
      events/
    lib/
    routes/
    tests/
  Dockerfile
  nginx.conf
  .dockerignore

docker-compose.yml

docs/
  authentication-architecture.md
  milestones/
```

## Installation

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

Backend variables are defined in `backend/.env.example`.

Expected backend configuration includes:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL_DAYS`
- `BCRYPT_SALT_ROUNDS`

Frontend variables are defined in `frontend/.env.example`.

Expected frontend configuration includes:

- `VITE_API_BASE_URL`

## API Overview

### OpenAPI 3.0 Interactive Documentation
Interactive Swagger UI available at: `http://localhost:4000/api/v1/docs`

### Authentication API (`/api/v1/auth`)

| Method | Endpoint | Description | Status |
| --- | --- | --- | --- |
| `POST` | `/register` | Register new user account & dispatch email | Implemented |
| `POST` | `/login` | Authenticate user & issue tokens | Implemented |
| `POST` | `/refresh-token` | Rotate refresh token & issue access token | Implemented |
| `POST` | `/logout` | Revoke refresh token & clear cookie | Implemented |
| `POST` | `/verify-email` | Verify email address using token | Implemented |
| `POST` | `/forgot-password` | Request password reset token & email | Implemented |
| `POST` | `/reset-password` | Reset password using token | Implemented |
| `GET` | `/me` | Get current authenticated user details | Implemented |

### Event Management API (`/api/v1/events`)

| Method | Endpoint | Description | Access Control | Status |
| --- | --- | --- | --- | --- |
| `POST` | `/` | Create new event | `SOCIETY`, `PLACEMENT_CELL`, `ADMIN` | Implemented |
| `GET` | `/` | List events with search, status & page filters | Role-aware (`STUDENT` sees `PUBLISHED`) | Implemented |
| `GET` | `/analytics` | Get event analytics & attendance conversion metrics | `SOCIETY`, `PLACEMENT_CELL`, `ADMIN` | Implemented |
| `GET` | `/:id` | Get event detail & user registration status | All auth users (`PUBLISHED`) / Organizer / `ADMIN` | Implemented |
| `PATCH` | `/:id` | Update event details | Organizer / `ADMIN` | Implemented |
| `DELETE` | `/:id` | Delete draft or cancel published event | Organizer / `ADMIN` | Implemented |
| `POST` | `/:id/register` | Register for event (with waitlist handling) | Authenticated Users | Implemented |
| `DELETE` | `/:id/register` | Cancel event registration (auto-promotes waitlist) | Authenticated Users | Implemented |
| `GET` | `/:id/export` | Export attendee list as CSV file | Organizer / `ADMIN` | Implemented |
| `GET` | `/:id/registrations` | List event registrants | Organizer / `ADMIN` | Implemented |
| `PATCH` | `/:id/approval` | Approve (`PUBLISHED`) or reject event | `ADMIN` | Implemented |
| `PATCH` | `/:id/attendance/:registrationId` | Mark attendance (`ATTENDED`, `NO_SHOW`) | Organizer / `ADMIN` | Implemented |

## Frontend Routes

| Route | Description | Access Control | Status |
| --- | --- | --- | --- |
| `/login` | User login screen | Public | Implemented |
| `/register` | Account registration screen | Public | Implemented |
| `/verify-email` | Email verification screen | Public | Implemented |
| `/forgot-password` | Password recovery request | Public | Implemented |
| `/reset-password` | Reset password screen | Public | Implemented |
| `/dashboard` | Event workspace, live stats & analytics widget | Protected | Implemented |
| `/events` | Event discovery feed with search & status filters | Protected | Implemented |
| `/events/new` | Event creation form | Protected (`SOCIETY`, `PLACEMENT_CELL`, `ADMIN`) | Implemented |
| `/events/:id` | Event detail, registration, cancel & CSV export | Protected | Implemented |

## Architecture Notes

The backend follows a route-controller-service-repository structure:

- Routes define endpoint paths and middleware composition.
- Controllers translate HTTP requests into service calls.
- Services contain business logic such as password hashing, token issuing, email rendering, event approval rules, capacity bounds, waitlist auto-promotion, analytics aggregation, and token rotation.
- Repositories isolate Prisma database access for `User`, `Token`, `Event`, and `EventRegistration`.
- Validators enforce request contracts with Zod.
- Middleware handles authentication, authorization, validation, and errors.

The frontend uses feature-based organization for authentication and events:

- Auth features live under `frontend/src/features/auth/`.
- Event features live under `frontend/src/features/events/` (`pages`, `services`, `hooks`, `schemas`).
- Dashboard UI lives under `frontend/src/features/dashboard/pages` (`EventAnalyticsWidget`).
- Shared UI primitives live under `frontend/src/components/ui`.
- Route protection is handled through `ProtectedRoute`.

More detail is available in `docs/authentication-architecture.md`.

## Testing

### Backend Tests (Node Test Runner + TSX)

```bash
cd backend
npm test
```

Current backend coverage includes 41 passing tests covering auth services, event services, E2E full-lifecycle integration, analytics aggregations, waitlist auto-promotion, CSV export, email dispatch, validators, and middleware.

### Frontend Tests (Vitest + React Testing Library + jsdom)

```bash
cd frontend
npm test
```

Current frontend coverage includes 9 passing unit & integration tests covering `LoginPage`, `RegisterPage`, `ProtectedRoute`, `CreateEventPage`, and `EventsListPage`.

## Progress Checklist

- [x] Project foundation
- [x] Backend authentication module
- [x] User and token database models
- [x] Login and registration frontend screens
- [x] Email verification frontend screen
- [x] Forgot password frontend screen
- [x] Reset password frontend screen
- [x] Protected route foundation
- [x] Event dashboard foundation
- [x] Event & EventRegistration database models
- [x] Backend Event Management REST API
- [x] Automated backend event & auth test suite (41 passing tests)
- [x] Connect frontend dashboard stats and actions to live event APIs
- [x] Frontend event discovery, event detail, and event creation screens
- [x] Automated frontend test suite (Vitest / React Testing Library, 9 passing tests)
- [x] Email delivery service integration (EmailService with HTML templates)
- [x] OpenAPI 3.0 / Swagger UI documentation (`/api/v1/docs`)
- [x] Event registration cancellation with waitlist auto-promotion
- [x] Event attendee list CSV export for organizers
- [x] Event analytics & attendance metrics visualizations widget
- [x] Production Docker containerization & Docker Compose orchestration
- [x] End-to-End (E2E) automated integration test suite & final platform audit

## Build-in-Public Journal

Milestone notes are stored in `docs/milestones/`:

- `docs/milestones/milestone-01-authentication-foundation.md`
- `docs/milestones/milestone-02-auth-recovery-verification-ux.md`
- `docs/milestones/milestone-03-backend-auth-test-coverage.md`
- `docs/milestones/milestone-04-event-dashboard-foundation.md`
- `docs/milestones/milestone-05-event-management-backend-api.md`
- `docs/milestones/milestone-06-frontend-event-integration-ux.md`
- `docs/milestones/milestone-07-automated-frontend-test-coverage.md`
- `docs/milestones/milestone-08-email-integration-and-openapi-docs.md`
- `docs/milestones/milestone-09-waitlist-promotion-and-csv-export.md`
- `docs/milestones/milestone-10-event-analytics-visualizations.md`
- `docs/milestones/milestone-11-production-docker-containerization.md`
- `docs/milestones/milestone-12-e2e-integration-suite-and-final-polish.md`






