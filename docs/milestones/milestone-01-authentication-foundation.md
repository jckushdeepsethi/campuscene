# Milestone 1: Authentication Foundation

Date: 2026-07-07

## 1. Development Summary

### What Was Built

The first milestone built the authentication foundation for CampusConnect.

Implemented backend capabilities:

- User registration with role selection.
- User login with JWT access tokens.
- HTTP-only refresh token cookies.
- Refresh token rotation.
- Logout with refresh token revocation.
- Email verification token generation and verification endpoint.
- Forgot password and reset password token workflows.
- Current user endpoint through `GET /api/v1/auth/me`.
- JWT authentication middleware.
- Role-based authorization middleware.
- Centralized request validation and error handling.

Implemented frontend capabilities:

- Login page.
- Registration page.
- Protected route wrapper.
- Dashboard placeholder for authenticated users.
- Axios API client with access token storage and credential support.
- React Query hooks for login, registration, logout, and current-user fetching.

### Why It Was Built

Authentication is the base layer for the rest of the platform. CampusConnect will eventually have different user journeys for students, societies, placement teams, and admins, so the project needed a reliable identity and role foundation before event or recruitment features could be added.

### What Problems It Solves

- Allows users to create accounts with a specific campus role.
- Protects private routes and API endpoints.
- Supports persistent sessions through refresh tokens.
- Keeps sensitive refresh tokens in HTTP-only cookies.
- Provides the foundation for future role-specific access control.
- Prepares the system for email verification and password recovery workflows.

### Technologies Used

Backend:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod
- cookie-parser
- Helmet, CORS, compression, and Morgan

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- lucide-react

### Challenges Faced

- Designing authentication in a way that supports multiple user roles from the beginning.
- Separating business logic from HTTP handlers so the code can grow cleanly.
- Handling refresh token rotation without storing raw tokens in the database.
- Keeping the frontend honest: only login and registration screens are implemented right now, even though the backend already has verification and reset endpoints.

### Important Engineering Decisions

- Used PostgreSQL with Prisma because the app will need relational data between users, events, registrations, applications, attendance records, and certificates.
- Used a route-controller-service-repository backend structure to keep responsibilities clear.
- Stored refresh, verification, and reset tokens as hashes instead of raw values.
- Used HTTP-only cookies for refresh tokens and bearer access tokens for authenticated API calls.
- Added role enums at the database level to avoid inconsistent authorization strings.
- Added API versioning under `/api/v1`.

### Lessons Learned

- Authentication is not just login and signup. A production-oriented foundation also needs refresh, logout, verification, password recovery, validation, and error handling.
- A clean folder structure matters early because future modules will copy the first module's patterns.
- Public documentation should separate implemented features from planned features so the project record stays credible.

## 2. LeetCode Community Post

### Milestone 1: Authentication Foundation for CampusConnect

Today I completed the first milestone of CampusConnect, an AI-powered campus event, recruitment, and opportunity management platform.

### What I Built Today

I implemented the authentication foundation for the application.

Backend work completed:

- User registration and login.
- JWT access token generation.
- Refresh token rotation with HTTP-only cookies.
- Logout with refresh token revocation.
- Email verification token model and endpoint.
- Forgot password and reset password token workflows.
- `GET /me` endpoint for authenticated users.
- Middleware for authentication, role-based authorization, request validation, and centralized error handling.

Frontend work completed:

- Login page.
- Registration page with role selection.
- Protected route setup.
- Dashboard placeholder for authenticated users.
- Auth-aware Axios client and React Query hooks.

### Screenshots

Insert screenshots here:

- Login page screenshot.
- Registration page screenshot.
- Protected dashboard placeholder screenshot.

### Technical Concepts Learned

- JWT-based authentication.
- Refresh token rotation.
- HTTP-only cookie usage for sensitive session tokens.
- Password hashing with bcrypt.
- Token hashing before database storage.
- Zod request validation.
- Role-based authorization.
- Repository pattern with Prisma.
- Protected frontend routes with React Router.
- Server-state mutations with TanStack Query.

### Challenges Overcome

The biggest challenge was designing the authentication system so it can support future modules without becoming tightly coupled. I separated routes, controllers, services, repositories, validators, and middleware so the next modules can follow the same structure.

Another challenge was documenting the progress accurately. The backend includes verification and password reset endpoints, but the frontend screens for those flows are not built yet, so I am keeping those items in the roadmap instead of presenting them as complete.

### What's Coming Next

Next, I plan to add one of the following:

- Frontend screens for email verification and password reset.
- Automated tests for the authentication module.
- Role-specific dashboard layouts.
- Event management features.

## 3. GitHub README Update

The README has been updated with:

- Current milestone status.
- Implemented authentication features.
- Screenshot placeholders.
- Backend and frontend setup instructions.
- Tech stack.
- Project structure.
- API overview.
- Architecture notes.
- Progress checklist.
- Future roadmap.
- Link to this milestone journal.

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: implement authentication foundation
feat: add role-based user schema and token models
feat: add auth API routes and middleware
feat: build login and registration pages
docs: document authentication architecture
docs: add milestone 1 build-in-public journal
docs: expand README with project status and roadmap
```

## 5. Resume Notes

Possible ATS-friendly resume bullet:

- Built a full-stack authentication foundation for a campus management platform using React, Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, and Zod, including role-based access control, refresh token rotation, and protected frontend routes.

## 6. Interview Preparation

### Explain Your Implementation.

I implemented authentication as a full-stack module. The backend uses Express and TypeScript with routes, controllers, services, repositories, validators, and middleware. Prisma handles PostgreSQL access. Users can register, log in, refresh sessions, log out, verify email tokens, request password resets, reset passwords, and fetch their profile. The frontend uses React with React Router, TanStack Query, React Hook Form, Zod, and Axios for login, registration, and protected routing.

### Why Did You Choose This Architecture?

I chose a layered architecture because authentication has security-sensitive business logic. Routes only define endpoints, controllers handle HTTP translation, services contain business rules, repositories isolate database queries, and middleware handles cross-cutting concerns. This makes the code easier to test and extend.

### Why PostgreSQL Over MongoDB?

CampusConnect will rely on relational workflows: users create events, students register for events, placement cells manage opportunities, certificates belong to attendance or completion records, and admins need audit trails. PostgreSQL is a strong fit because it supports structured relationships, constraints, indexes, and transactional consistency.

### How Does JWT Authentication Work Here?

After login, the backend signs a short-lived access token containing the user's ID and role. The frontend sends that token in the `Authorization` header. The backend authentication middleware verifies the token, extracts the user identity, and attaches it to the request.

### How Does Refresh Token Rotation Work?

The backend creates an opaque refresh token and stores only its hash in the database. The raw token is sent in an HTTP-only cookie. When the client refreshes the session, the backend validates the token, creates a new token pair, revokes the old refresh token, and links it to the replacement.

### Why Store Token Hashes?

Hashing tokens reduces risk if the database is exposed. An attacker should not be able to use stored refresh, verification, or reset token values directly.

### Why Did You Choose This Database Schema?

The schema separates users from refresh tokens, email verification tokens, and password reset tokens. This supports multiple sessions per user, token expiry, token revocation, and single-use verification or reset workflows.

### How Does Role-Based Authorization Work?

The JWT contains the user's role. The authentication middleware verifies the token and attaches the role to the request. The authorization middleware checks whether that role is included in the list allowed for a route.

### What Improvements Would You Make at Scale?

I would add rate limiting, audit logs, email delivery, automated tests, session management UI, device tracking, stricter cookie settings for production, observability, and possibly a cache or token cleanup job for expired tokens.

## 7. Engineering Improvements

### Code Quality

The code is organized clearly and follows a maintainable separation of concerns. The route-controller-service-repository structure is a good foundation for future modules.

Suggested improvement:

- Add automated tests for services, controllers, middleware, and validation schemas.

### Folder Structure

The backend and frontend structures are easy to understand. The auth feature is isolated on the frontend, and backend concerns are separated by responsibility.

Suggested improvement:

- Add module-level README files once event, recruitment, and certificate modules are introduced.

### Performance

The current implementation is lightweight. Prisma indexes exist on important token and user fields.

Suggested improvement:

- Add a scheduled cleanup job for expired tokens.

### Security

Strong decisions already exist: bcrypt password hashing, token hashing at rest, HTTP-only refresh cookies, Zod validation, Helmet, CORS, and centralized auth middleware.

Suggested improvements:

- Add rate limiting to login, forgot password, and reset password endpoints.
- Add account lockout or progressive delay for repeated failed login attempts.
- Add CSRF protection strategy for cookie-based refresh endpoints.
- Ensure production cookie settings are reviewed before deployment.
- Avoid returning development tokens outside local development.

### Scalability

The layered backend structure can scale into more modules without mixing HTTP logic and business rules.

Suggested improvements:

- Add pagination and filtering patterns before building list-heavy modules.
- Add observability and structured logging before production deployment.

### Database Design

The schema correctly separates users from token records and uses enums for role and status.

Suggested improvements:

- Add migrations to source control after database migration is run.
- Consider audit tables for security-sensitive user actions.

### UI/UX

The login and registration flows are clean and focused. The dashboard is intentionally still a placeholder.

Suggested improvements:

- Add user-facing success states after registration.
- Add forgot password, reset password, and email verification screens.
- Add role-specific dashboard entry points.

### API Design

The API is versioned and uses consistent auth endpoints.

Suggested improvements:

- Document request and response examples.
- Add OpenAPI documentation once the next module is started.

### Naming Conventions

Names are clear and consistent across backend and frontend.

Suggested improvement:

- Keep future modules consistent with the current `routes/controllers/services/repositories/validators` pattern.

