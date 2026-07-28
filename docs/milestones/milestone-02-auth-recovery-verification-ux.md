# Milestone 2: Auth Recovery and Verification UX

Date: 2026-07-27

## 1. Development Summary

### What Was Built

This milestone added the missing frontend screens for authentication recovery and verification workflows.

Implemented frontend capabilities:

- Email verification page at `/verify-email`.
- Forgot password page at `/forgot-password`.
- Reset password page at `/reset-password`.
- Token form validation for verification and reset flows.
- Password reset form validation using the same password rules as registration.
- Auth API client methods for verify email, forgot password, and reset password.
- React Query mutation hooks for the new auth flows.
- Login page link to the forgot password flow.
- Router entries for all new auth pages.
- Support for pasted tokens and `?token=...` URL links.

### Why It Was Built

The backend already supported email verification and password reset endpoints, but users had no frontend screens to access those flows. This milestone connected the existing API capability to real user-facing pages.

### What Problems It Solves

- Users can now verify their email through the frontend.
- Users can request a password reset token from the frontend.
- Users can reset their password through the frontend.
- The app now has a more complete authentication journey instead of only login and registration.
- Development reset tokens returned by the backend in local development can be used immediately during testing.

### Technologies Used

- React
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- lucide-react

### Challenges Faced

- The backend currently returns reset tokens only in development mode, and real email delivery is not implemented yet. The frontend therefore supports manual token entry and URL token prefill.
- The UI needed to avoid claiming that email delivery exists before it is actually implemented.
- The reset password flow needed to reuse the same password strength rules as registration.

### Important Engineering Decisions

- Added pages inside the existing `features/auth/pages` folder to preserve feature-based organization.
- Added schemas in the existing auth schema file so validation remains centralized.
- Added API methods in the existing auth API service instead of creating a separate recovery service too early.
- Supported `?token=...` query parameters so future email links can work without changing the page structure.
- Kept email provider integration in the roadmap because it is not implemented yet.

### Lessons Learned

- A backend endpoint is not a complete feature until users can access it through the product experience.
- Manual token entry is acceptable for local development, but production needs email delivery and polished success states.
- Build-in-public documentation should clearly explain what is complete and what remains intentionally unfinished.

## 2. LeetCode Community Post

### Milestone 2: Added Auth Recovery and Verification Screens

Today I completed the second milestone of CampusConnect, my campus event, recruitment, and opportunity management platform.

### What I Built Today

I added the missing frontend screens for the authentication recovery flows that were already supported by the backend.

Completed work:

- Email verification page.
- Forgot password page.
- Reset password page.
- Frontend validation for tokens and password reset.
- API client methods for verify email, forgot password, and reset password.
- React Query mutation hooks for the new flows.
- Router entries for the new auth pages.
- Forgot password link from the login page.
- Query parameter support for token-based links.

### Screenshots

Insert screenshots here:

- Email verification page screenshot.
- Forgot password page screenshot.
- Reset password page screenshot.

### Technical Concepts Learned

- Connecting existing backend endpoints to frontend user flows.
- Form validation with Zod and React Hook Form.
- Mutation handling with TanStack Query.
- Token-based account workflows.
- Route-based UX design with React Router.
- Keeping development-only behavior separate from production claims.

### Challenges Overcome

The main challenge was designing a frontend flow before real email delivery exists. I solved this by supporting manual token entry and `?token=...` URL prefill. This keeps the feature testable now and ready for future email links later.

### What's Coming Next

Next, I plan to improve the authentication module with:

- Automated tests for backend services and middleware.
- Email delivery integration for verification and reset links.
- Better success states after registration and password reset.
- Role-specific dashboard shells.

## 3. GitHub README Update

The README has been updated with:

- Milestone 2 status.
- New frontend auth recovery routes.
- New screenshot placeholders.
- Updated feature checklist.
- Updated roadmap.
- Link to this milestone journal.

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: add auth recovery and verification screens
feat: connect frontend to email verification and password reset APIs
feat: add token-based auth form validation
docs: document milestone 2 auth recovery UX
docs: update README progress and roadmap
```

## 5. Resume Notes

Possible ATS-friendly resume bullet:

- Extended a full-stack authentication system by adding React-based email verification, forgot password, and reset password flows connected to Express APIs, with Zod validation, React Hook Form state management, and token-prefill support for future email links.

## 6. Interview Preparation

### Explain Your Implementation.

I added three frontend screens for account verification and recovery. The pages use React Hook Form with Zod schemas for validation. They call existing backend endpoints through the shared Axios auth API service and use TanStack Query mutations for async state. The verify and reset pages can read a `token` query parameter, which prepares the app for future email links.

### Why Did You Add These Screens After the Backend?

The backend already had the business logic, but users could not access those workflows. Adding the frontend screens turns the endpoints into usable product flows and completes more of the authentication journey.

### How Does the Forgot Password Flow Work?

The user submits their email on `/forgot-password`. The frontend calls `POST /auth/forgot-password`. In development, the backend can return a reset token for testing. In production, the response does not expose the token and should be paired with an email provider.

### How Does the Reset Password Flow Work?

The user provides a reset token and a new password on `/reset-password`. The frontend validates the input and calls `POST /auth/reset-password`. The backend validates the token, hashes the new password, updates the user record, and marks the token as used.

### Why Support `?token=...` in the URL?

Email links commonly include tokens in the URL. Supporting this now means future email integration can route users directly to prefilled verification or reset forms without changing the page architecture.

### What Security Concerns Remain?

The project still needs rate limiting, CSRF protection strategy for cookie-based endpoints, production email delivery, audit logs, and automated tests around token expiry and reuse.

### What Improvements Would You Make Before Production?

I would add email delivery, remove any development-only token exposure from deployed environments, add rate limits to sensitive endpoints, add automated tests, and improve user-facing success/error messages.

## 7. Engineering Improvements

### Code Quality

The implementation follows the existing auth feature structure and keeps validation, API calls, hooks, and pages separated.

Suggested improvement:

- Extract repeated auth form field error rendering into a small helper component if more auth pages are added.

### Folder Structure

The new pages fit cleanly under `frontend/src/features/auth/pages`.

Suggested improvement:

- Consider an `authRoutes.ts` constants file once links are reused across dashboards and emails.

### Performance

The new pages are lightweight and do not introduce expensive client-side work.

Suggested improvement:

- Consider route-level code splitting later if the frontend grows significantly.

### Security

The frontend no longer leaves verification and reset endpoints inaccessible, but production hardening is still needed.

Suggested improvements:

- Integrate a real email provider.
- Add rate limiting on auth recovery endpoints.
- Add CSRF protection strategy for refresh/logout flows.
- Improve copy so token handling is not exposed in production UX once email delivery exists.

### Scalability

The auth flow is now easier to expand because verification and recovery pages already support token links.

Suggested improvement:

- Add end-to-end tests for complete auth journeys before building more modules.

### Database Design

No database schema changes were made in this milestone. The existing password reset and email verification token tables support the new screens.

Suggested improvement:

- Add a cleanup strategy for expired verification and reset tokens.

### UI/UX

The flows are now reachable and functional. Manual token entry is practical for development.

Suggested improvements:

- Add polished email-sent confirmation screens.
- Add automatic redirect after successful verification.
- Add a visible path from registration to email verification when email delivery is implemented.

### API Design

The frontend now uses existing API endpoints consistently.

Suggested improvement:

- Add documented request and response examples for auth endpoints.

### Naming Conventions

Names match the existing auth module conventions.

Suggested improvement:

- Keep future auth additions grouped by workflow names such as `verifyEmail`, `forgotPassword`, and `resetPassword`.

