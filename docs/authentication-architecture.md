# Authentication Module Architecture

## Why This Architecture

CampuScene separates concerns using a clean MVC and repository-oriented structure:

- Routes only define HTTP endpoints and middleware composition.
- Controllers translate HTTP requests into service calls.
- Services contain business rules such as password hashing, token issuing, and account checks.
- Repositories isolate Prisma database access from business logic.
- Validators enforce request contracts before a controller runs.
- Middleware handles cross-cutting concerns such as authentication, authorization, and errors.

This keeps the code testable, scalable, and easier to extend when event creation, event registration, attendance, and event review modules are added.

## Packages

Backend:

- `express`: Stable REST API framework.
- `@prisma/client` and `prisma`: Type-safe PostgreSQL access and migrations.
- `jsonwebtoken`: Access and refresh token creation and verification.
- `bcrypt`: Secure password hashing.
- `zod`: Runtime validation for request bodies and environment variables.
- `cookie-parser`: Reads refresh token cookies.
- `cors`, `helmet`, `compression`, `morgan`: Production HTTP security, performance, and request logging.
- `dotenv`: Environment variable loading in local development.

Frontend:

- `react`, `react-dom`, `vite`, `typescript`: Fast typed frontend foundation.
- `react-router-dom`: Client-side routing and protected route composition.
- `@tanstack/react-query`: Server-state fetching, mutation, caching, and invalidation.
- `react-hook-form` and `zod`: Type-safe forms with shared validation style.
- `axios`: HTTP client with auth-aware interceptors.
- `tailwindcss`, `clsx`, `tailwind-merge`: Utility-first styling and class composition.
- `framer-motion`: Smooth transitions for auth and future dashboard states.

## Database Relationships

- `User` is the core identity table.
- `User.role` controls authorization and dashboard access.
- `RefreshToken` has many rows per user, allowing per-device sessions and token revocation.
- `EmailVerificationToken` belongs to one user and expires after a short window.
- `PasswordResetToken` belongs to one user and expires after a short window.

Future event modules will reference `User` for event ownership, registrations, attendance scans, admin review, and audit trails.

## API Design

Base path: `/api/v1/auth`

- `POST /register`: Creates a user and verification token.
- `POST /login`: Verifies credentials and returns an access token while setting an HTTP-only refresh cookie.
- `POST /refresh-token`: Rotates refresh tokens and returns a new access token.
- `POST /logout`: Revokes the active refresh token and clears the cookie.
- `POST /forgot-password`: Creates a password reset token.
- `POST /reset-password`: Resets password using token.
- `POST /verify-email`: Marks email as verified.
- `GET /me`: Returns the authenticated user.

## Security Considerations

- Passwords are hashed with bcrypt before storage.
- Access tokens are short lived.
- Refresh tokens are hashed at rest and stored in HTTP-only cookies.
- Refresh token rotation limits replay damage.
- Zod validates request payloads before business logic.
- Helmet sets defensive HTTP headers.
- CORS is restricted by `FRONTEND_URL`.
- Role based access control is centralized in middleware.
- Password reset and email verification tokens are hashed at rest and expire.

## Scalability Improvements

- Repositories make it easy to add caching or read replicas later.
- Service layer can be tested without HTTP.
- Token persistence supports multiple devices per account.
- Role enums prevent inconsistent authorization strings.
- API versioning allows future breaking changes without disrupting deployed clients.

## Future Improvements

- Add rate limiting for login and reset endpoints.
- Add Resend email delivery templates.
- Add audit logs for security events.
- Add two-factor authentication for admins and event managers.
- Add OAuth/SAML for university identity providers.
- Add session management UI so users can revoke devices.
