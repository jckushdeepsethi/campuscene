# Milestone 5: Event Management Backend API

Date: 2026-07-28

## 1. Development Summary

### What Was Built

This milestone implemented the backend data models, business services, controllers, Zod validation schemas, role-based access controls, and RESTful API endpoints for the **Event Management** module of CampusConnect.

Implemented backend capabilities:

- Prisma database models: `Event` and `EventRegistration`.
- Prisma database enums: `EventStatus` (`DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `REJECTED`, `CANCELLED`, `COMPLETED`) and `RegistrationStatus` (`REGISTERED`, `CANCELLED`, `WAITLISTED`, `ATTENDED`, `NO_SHOW`).
- RESTful Event API Endpoints (`/api/v1/events`):
  - `POST /api/v1/events` – Create new event with role-based default status (`PENDING_APPROVAL` for `SOCIETY`, `PUBLISHED` for `PLACEMENT_CELL` / `ADMIN`).
  - `GET /api/v1/events` – List events with pagination (`page`, `limit`), search filtering, organizer filtering, and role-based visibility control.
  - `GET /api/v1/events/:id` – Fetch event detail with user's registration status.
  - `PATCH /api/v1/events/:id` – Update event details (restricted to event organizer or `ADMIN`).
  - `DELETE /api/v1/events/:id` – Delete draft event or cancel published event (restricted to organizer or `ADMIN`).
  - `POST /api/v1/events/:id/register` – Register for a published event with automatic capacity check & waitlist assignment.
  - `GET /api/v1/events/:id/registrations` – List all student registrations for an event (restricted to organizer or `ADMIN`).
  - `PATCH /api/v1/events/:id/approval` – Approve or reject a pending event (restricted to `ADMIN`).
  - `PATCH /api/v1/events/:id/attendance/:registrationId` – Mark attendance state (`ATTENDED`, `NO_SHOW`, etc.) with automated timestamp tracking.
- Automated unit test suite expansion: 14 new unit tests added (total: 34 tests passing).

### Why It Was Built

The authentication system and event dashboard shell were in place, but users could not perform real event operations. Building the backend event management API satisfies the core functional requirement of CampusConnect: enabling societies and placement teams to organize campus events and students to register and check in.

### What Problems It Solves

- Establishes a structured approval flow so society-organized events require admin verification before publication.
- Prevents over-booking by enforcing venue capacity limits and placing overflow registrants on a waitlist.
- Enforces strict role-based data isolation so students cannot view unapproved drafts or alter event details.
- Provides attendance check-in capabilities for event organizers with timestamp audit logs.

### Technologies Used

- Node.js & Express 5
- TypeScript
- Prisma ORM & PostgreSQL
- Zod request validation
- JWT & RBAC authorization middleware
- Node.js built-in test runner (`node --test`) & `tsx`

### Challenges Faced

- Designing role-specific list visibility rules so `STUDENT` users only see `PUBLISHED` events, while `SOCIETY` users see published events alongside their own drafts and pending events.
- Handling race conditions and capacity bounds gracefully during event registration to transition users to `WAITLISTED` state when capacity is exceeded.
- Maintaining clean mapping between Prisma relation inputs and standard DTO shapes across nested queries.

### Important Engineering Decisions

- **State Machine for Approvals**: `SOCIETY` users cannot publish directly; their events land in `PENDING_APPROVAL` status until an `ADMIN` approves them via `PATCH /api/v1/events/:id/approval`.
- **Soft Cancellation**: Deleting a non-draft event transitions its status to `CANCELLED` rather than destroying database audit history.
- **Unique Constraint on Registrations**: A `@@unique([eventId, userId])` index in Prisma guarantees that duplicate registration attempts fail deterministically at the database level.

### Lessons Learned

- Coupling Zod `endsAt > startsAt` refinements with controller parsing catches invalid date intervals early before touching the database.
- Isolating repository calls into a dedicated `EventRepository` layer makes unit testing the service layer fast and reliable with in-memory test mocks.

---

## 2. LeetCode Community Post

### Milestone 5: Built the Event Management Backend API

Today I completed the fifth milestone of CampusConnect by implementing the complete backend data layer, REST API endpoints, role-based workflows, and unit test suite for event creation, registration, admin approval, and attendance tracking!

### What I Built Today

I added:

- `Event` & `EventRegistration` Prisma database models and status enums.
- REST endpoints for event CRUD (`/api/v1/events`).
- Event registration API with capacity check & waitlisting (`POST /api/v1/events/:id/register`).
- Admin approval/rejection endpoint (`PATCH /api/v1/events/:id/approval`).
- Event attendance check-in API (`PATCH /api/v1/events/:id/attendance/:registrationId`).
- 14 new automated unit tests covering service logic and validation rules (34 total tests passing).

### Technical Concepts Learned

- Designing multi-role access control matrices in Express middleware.
- Date range validation refinements with Zod (`endsAt` after `startsAt`).
- Waitlist allocation algorithms based on event capacity bounds.
- Prisma relation mapping for multi-role user associations (`organizer` vs `approvedBy`).

### Challenges Overcome

The trickiest part was ensuring strict role-based visibility rules when searching and listing events. I implemented custom filtering logic in `EventService` so students only retrieve published events, organizers see their own drafts, and admins can inspect all status states.

### What's Coming Next

Next, I plan to build the frontend Event Management features:

- Connecting the dashboard action cards to live backend event APIs.
- Creating the Event Discovery feed (`/events`).
- Creating the Event Details page (`/events/:id`) with registration buttons.
- Creating the Event Creation & Management form (`/events/new`).

---

## 3. GitHub README Update

The README has been updated with:

- Milestone 5 completion status.
- New database models (`Event`, `EventRegistration`).
- Complete backend Event API endpoints table.
- Updated progress checklist.
- Updated backend test coverage metric (34 passing tests).
- Link to this milestone journal.

---

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: implement event and registration database models
feat: add event management backend API endpoints and service logic
feat: add event validation schemas and role-aware query filtering
test: add unit tests for event service and validator module
docs: document milestone 5 event management backend API
docs: update README with event API specification and test status
```

---

## 5. Resume Notes

ATS-friendly resume bullet points:

- Designed and implemented a RESTful Event Management API using Node.js, Express, TypeScript, and Prisma ORM supporting role-based CRUD operations, capacity-constrained registration with waitlist handling, and admin approval workflows.
- Engineered role-aware database query abstractions and Zod validation schemas, expanding automated test coverage to 34 unit tests.

---

## 6. Interview Preparation

### Explain Your Event Registration Architecture.

Event registration handles concurrency and capacity limits. When a student registers for an event (`POST /api/v1/events/:id/register`), the system verifies that the event status is `PUBLISHED` and the end time has not passed. It queries existing active registrations and compares them against the event's `capacity`. If space is available, the registration is saved as `REGISTERED`; if the capacity limit is reached, it is automatically assigned status `WAITLISTED`. A `@@unique([eventId, userId])` database constraint prevents duplicate active registrations.

### How Do You Enforce Role Permissions on Event Endpoints?

Endpoints are guarded by composite middleware: `authenticate` verifies the JWT access token and attaches `req.auth`, while `authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN")` checks the user's role against permitted roles. Business-level checks (e.g., verifying if the requesting user is the organizer of a specific event before permitting updates) are handled inside `EventService`.

### Why Use Soft Cancellations for Published Events?

If an organizer cancels a published event that already has registered attendees, deleting the database row would erase audit records and break references for registered students. By updating the status to `CANCELLED`, we preserve data integrity while notifying client interfaces that the event is no longer active.

---

## 7. Engineering Improvements

### Code Quality

- **Repository Abstraction**: Database queries are encapsulated within `EventRepository`, maintaining clean separation between Express routing, business rules, and database access.
- **Strong Typing**: All inputs, query strings, and outputs are strictly typed with Zod inferences and TypeScript interfaces.

### Security

- **Role-Based Isolation**: Non-admin users cannot approve events or view unapproved drafts belonging to other organizers.
- **Input Sanitization**: All search filters and path parameters pass through Zod schemas to protect against injection and unexpected formats.

### Scalability & Performance

- **Database Indexing**: Added composite and target indexes on `[status]`, `[organizerId]`, `[startsAt]`, `[eventId]`, and `[userId]` for high-performance filter execution.
- **Paginated Listing**: Default pagination (`page`, `limit`) prevents un-bounded query loads on event lists.
