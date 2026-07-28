# Milestone 3: Backend Auth Test Coverage

Date: 2026-07-27

## 1. Development Summary

### What Was Built

This milestone added automated backend tests for the authentication module.

Implemented:

- `npm test` script for the backend.
- Node's built-in test runner configured with `tsx` for TypeScript tests.
- Auth service tests for registration, duplicate email handling, login, suspended user rejection, refresh token rotation, email verification, and password reset.
- Validator tests for registration, login, token, forgot password, and reset password schemas.
- Middleware tests for JWT authentication and role-based authorization.
- Utility tests for opaque token generation, token hashing, date helpers, JWT signing, and JWT verification.
- A small dependency-injection refactor in `AuthService` so service logic can be tested with in-memory fake repositories instead of a real database.

### Why It Was Built

Authentication is one of the riskiest parts of the platform. Before expanding into dashboards, events, recruitment, or certificates, the project needed automated tests around the auth foundation.

### What Problems It Solves

- Catches regressions in password hashing and token storage behavior.
- Verifies refresh token rotation revokes the previous token.
- Confirms validation schemas reject weak or malformed input.
- Checks that authentication and authorization middleware return the correct errors.
- Makes future auth refactors safer.
- Allows service-level testing without depending on a live PostgreSQL database.

### Technologies Used

- Node.js test runner
- `tsx`
- TypeScript
- Node `assert`
- bcrypt
- JWT utilities
- Zod validators
- In-memory fake repositories

### Challenges Faced

- The first test command used `tsx --test`, but it hit a sandbox IPC restriction while trying to open a temp pipe.
- The solution was to use Node's native test runner with `tsx` as an import hook: `node --import tsx --test tests/*.test.ts`.
- The original `AuthService` created repository instances internally, so it needed a small constructor-based dependency injection change for isolated tests.

### Important Engineering Decisions

- Used Node's built-in test runner instead of adding a new testing framework dependency.
- Kept tests focused on backend authentication because frontend tests still need their own setup.
- Used fake repositories for service tests to avoid coupling unit tests to Prisma or PostgreSQL.
- Preserved production behavior by making injected repositories optional.

### Lessons Learned

- Testability often reveals where code is too tightly coupled.
- Dependency injection does not need to be heavy; a small constructor parameter can make core logic much easier to verify.
- Built-in platform tools can be enough for early-stage test coverage.

## 2. LeetCode Community Post

### Milestone 3: Added Backend Tests for Authentication

Today I completed the third milestone of CampusConnect by adding automated backend tests for the authentication module.

### What I Built Today

I added a backend test suite covering:

- Registration.
- Duplicate email handling.
- Login.
- Suspended user rejection.
- Refresh token rotation.
- Email verification.
- Password reset.
- Zod auth validators.
- JWT authentication middleware.
- Role-based authorization middleware.
- Token hashing and opaque token generation.
- JWT signing and verification.

I also refactored the auth service slightly so repositories can be injected during tests. This keeps production behavior the same while making service logic testable without a database.

### Screenshots

Insert screenshot here:

- Terminal screenshot showing `npm test` passing with 20 tests.

### Technical Concepts Learned

- Unit testing with Node's built-in test runner.
- Running TypeScript tests with `tsx`.
- Dependency injection for testability.
- Testing service-layer business rules without a live database.
- Testing Express middleware through mocked request objects.
- Testing token security behavior without exposing raw tokens.

### Challenges Overcome

The first test runner command failed because of a sandbox restriction around a temporary IPC pipe. I switched to Node's native runner with `tsx` as an import hook, and the full suite ran successfully.

### What's Coming Next

Next, I plan to add one of the following:

- Email delivery for verification and reset links.
- Frontend tests for auth pages and protected routes.
- Role-specific dashboard shells.
- OpenAPI documentation for the auth API.

## 3. GitHub README Update

The README has been updated with:

- Milestone 3 status.
- Backend test command.
- Backend auth test coverage summary.
- Updated progress checklist.
- Updated roadmap.
- Link to this milestone journal.
- Corrected backend environment variable naming.

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
test: add backend auth test suite
refactor: inject auth service repositories for tests
test: cover auth validators and middleware
test: cover jwt and token utilities
docs: document milestone 3 backend auth coverage
docs: update README test instructions and roadmap
```

## 5. Resume Notes

Possible ATS-friendly resume bullet:

- Added automated backend authentication tests for a TypeScript Express API using Node's test runner, covering registration, login, refresh token rotation, password reset, JWT middleware, Zod validation, and token utilities with dependency-injected service fakes.

## 6. Interview Preparation

### Explain Your Implementation.

I added backend tests for the authentication module using Node's built-in test runner and `tsx`. The tests cover service behavior, validation schemas, middleware, and utility functions. I also refactored `AuthService` to accept optional repository dependencies, which allows tests to use in-memory fake repositories while production still uses the real Prisma repositories.

### Why Did You Use Dependency Injection?

The service originally created repository instances internally, which made it difficult to test without a database. Dependency injection lets the test pass fake repositories while keeping the production default unchanged.

### Why Not Test Directly Against PostgreSQL?

Database integration tests are valuable, but they require more setup and slower execution. For this milestone, I focused on fast service and unit tests. Integration tests with a test database can be added later.

### What Does the Refresh Token Test Verify?

It verifies that a valid refresh token produces a new token pair and revokes the previous refresh token with a reference to the replacement token record.

### What Security Behaviors Are Tested?

The tests verify that verification tokens are stored as hashes, login rejects suspended users, weak passwords fail validation, JWT middleware rejects missing tokens, and role middleware blocks unauthorized roles.

### Why Use Node's Built-In Test Runner?

It avoids adding another dependency and is enough for the current backend test needs. The project can still move to Vitest or Jest later if mocking, coverage reports, or richer frontend testing becomes necessary.

### What Improvements Would You Make Next?

I would add controller tests, integration tests against a test PostgreSQL database, coverage reporting, frontend tests, and CI automation so every pull request runs builds and tests.

## 7. Engineering Improvements

### Code Quality

The `AuthService` is now more testable while preserving existing production usage.

Suggested improvement:

- Define explicit repository interfaces instead of relying on concrete repository class shapes.

### Folder Structure

Tests now live under `backend/tests`, keeping them separate from production source files.

Suggested improvement:

- Group future tests by module as the backend grows, for example `tests/auth` and `tests/events`.

### Performance

The test suite is fast and avoids database startup overhead.

Suggested improvement:

- Add separate integration tests that can run in CI when a test database is available.

### Security

The tests now cover important auth security behaviors, including hashed tokens and authorization failures.

Suggested improvements:

- Add tests for expired and reused verification/reset tokens.
- Add tests for invalid JWT roles.
- Add rate limiting before production.

### Scalability

Having tests this early makes it easier to expand the auth module without fear of regressions.

Suggested improvement:

- Add CI so tests run automatically before merges.

### Database Design

No schema changes were made in this milestone.

Suggested improvement:

- Add integration tests for Prisma constraints, especially unique email and unique token hashes.

### UI/UX

No UI changes were made in this milestone.

Suggested improvement:

- Add frontend tests for validation messages, redirects, and protected routing.

### API Design

The existing API behavior is now better protected by tests.

Suggested improvement:

- Add controller-level tests to verify exact HTTP status codes and response shapes.

### Naming Conventions

Test names describe expected behavior clearly.

Suggested improvement:

- Continue using behavior-focused test names as new modules are added.

