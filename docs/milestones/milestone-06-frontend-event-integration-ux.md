# Milestone 6: Frontend Event Integration & Event Management Pages

Date: 2026-07-28

## 1. Development Summary

### What Was Built

This milestone connected the protected event dashboard shell to the live backend Event Management API and delivered full-featured frontend user interfaces for campus event discovery, event creation, registration management, admin approvals, and attendance check-in.

Implemented frontend capabilities:

- **Frontend Event Feature Module (`frontend/src/features/events/`)**:
  - `eventsApi.ts` – Service client methods calling `/api/v1/events` endpoints.
  - `useEvents.ts` – TanStack Query hooks for event listing, event detail, event creation, student registration, admin approval, and attendance tracking.
  - `eventSchemas.ts` – Zod validation schemas for event form fields and date ordering.
- **Event Discovery Feed (`/events`)**:
  - Search bar filtering events by title, description, or venue.
  - Filter pills (`All Events`, `Published`, `Pending Approval`, `Drafts`).
  - Event cards displaying organizer badge, start/end dates, venue, capacity progress bar, status pill, and detail links.
  - Header button for society leads and admins to create new events.
- **Event Creation Workspace (`/events/new`)**:
  - Form validation powered by React Hook Form & Zod.
  - Date-time pickers for `startsAt` and `endsAt` with automatic validation (`endsAt > startsAt`).
  - Role-aware submission selector (`PENDING_APPROVAL` for `SOCIETY`, `PUBLISHED` for `PLACEMENT_CELL` / `ADMIN`).
- **Event Details & Attendance Workspace (`/events/:id`)**:
  - Comprehensive details banner showing venue, date/time interval, organizer role, and capacity fill percentage.
  - Student registration action button ("Register for Event", "Waitlisted", or "Already Registered").
  - Admin Approval Banner (`Approve & Publish` / `Reject Event`) for `PENDING_APPROVAL` events.
  - Organizer Registrant Table displaying attendee details with inline attendance check-in triggers (`ATTENDED` / `NO_SHOW`).
  - Delete/Cancel event action for organizers or admins.
- **Live Event Dashboard Integration (`/dashboard`)**:
  - Populated stats counters dynamically from live query data (`Published Events`, `Pending Approvals`, `Total Managed Events`).
  - Replaced disabled action cards with active navigation links pointing directly to `/events`, `/events/new`, and `/events?status=PENDING_APPROVAL`.

### Why It Was Built

The backend Event API was fully functional, but users had no visual UI to browse events, submit new event forms, register, or approve pending society requests. Building these screens completes the end-to-end event management product experience.

### What Problems It Solves

- Eliminates static placeholders on the user dashboard.
- Gives students a clear visual discovery feed with real-time capacity and registration status indicators.
- Enables campus society organizers to submit events easily and track attendee registrations.
- Provides admins with an intuitive one-click review panel to inspect pending events and approve them for public listing.

### Technologies Used

- React 19 & TypeScript
- Vite & Tailwind CSS
- React Router (declarative route protection)
- TanStack Query (React Query for asynchronous state & cache invalidation)
- React Hook Form & Zod (form validation)
- Lucide React icons

### Challenges Faced

- Handling dynamic date-time formatting and timezone rendering across input fields and cards.
- Ensuring TanStack Query cache invalidation triggers seamlessly across event lists, detail views, and dashboard counters upon registration or status changes.

### Important Engineering Decisions

- **Role-Aware UI Rendering**: Form inputs and approval controls adapt dynamically based on the current user's role obtained from `useCurrentUser()`.
- **Automatic Cache Invalidation**: Mutations (`useRegisterEvent`, `useApproveEvent`, `useMarkAttendance`) automatically invalidate related query keys so list views and detail views refresh instantly without manual page reloads.

---

## 2. LeetCode Community Post

### Milestone 6: Connected Live Event APIs & Built Frontend Event Management Workspace

Today I completed the sixth milestone of CampusConnect by connecting the frontend React dashboard to our live Node.js/Prisma event backend and building complete user interfaces for event discovery, creation, registration, admin review, and attendance check-in!

### What I Built Today

I added:

- An Event API service client & React Query custom hooks (`useEvents`, `useEventDetail`, `useRegisterEvent`, `useApproveEvent`, `useMarkAttendance`).
- Live Event Discovery page (`/events`) with search filtering and status pills.
- Event Creation page (`/events/new`) with Zod form validation.
- Event Detail workspace (`/events/:id`) with registration, admin review controls, and registrant attendance check-in table.
- Connected live statistics and active navigation on the user dashboard (`/dashboard`).

### Technical Concepts Learned

- React Query query key management & multi-query invalidation.
- React Hook Form integration with Zod schemas for date interval validation.
- Declarative route protection with React Router.
- Building accessible, responsive data tables with Tailwind CSS.

### Challenges Overcome

The main challenge was ensuring that state mutations (like an admin approving an event or a student registering) immediately updated the count badges on the main dashboard as well as the event feed without requiring a full window reload. I solved this by grouping query keys under `eventKeys` and calling `queryClient.invalidateQueries({ queryKey: eventKeys.all })` on successful mutations.

### What's Coming Next

Next, I plan to work on:

- Adding automated frontend tests (Vitest / React Testing Library) for auth pages, protected routing, and event feed rendering.
- Setting up real email delivery (e.g. Nodemailer/Resend) for verification tokens and reset links.
- Adding OpenAPI / Swagger documentation for backend endpoints.

---

## 3. GitHub README Update

The README has been updated with:

- Milestone 6 status.
- Updated frontend routes table (`/events`, `/events/new`, `/events/:id`).
- Updated progress checklist.
- Updated roadmap.
- Link to this milestone journal.

---

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: add event API service and React Query hooks
feat: build event discovery feed with search and status filters
feat: build event creation form with Zod validation
feat: build event detail page with registration and attendance check-in
feat: connect live event statistics and navigation to dashboard
docs: document milestone 6 frontend event integration
docs: update README with new frontend routes and progress checklist
```

---

## 5. Resume Notes

ATS-friendly resume bullet points:

- Developed full-stack event discovery, creation, registration, and attendance check-in interfaces using React 19, TypeScript, TanStack Query, and Tailwind CSS.
- Implemented real-time dashboard statistics and role-aware navigation, integrating Zod validation and query cache invalidation for seamless UX state management.

---

## 6. Interview Preparation

### How Do You Handle Asynchronous State Updates When a Student Registers for an Event?

When a student clicks "Register for Event", `useRegisterEvent` executes a POST request to `/api/v1/events/:id/register`. On success, TanStack Query triggers `queryClient.invalidateQueries` for both `eventKeys.detail(id)` and `eventKeys.lists()`. This automatically triggers background refetches so the registration status pill, registrant count, capacity bar, and dashboard statistics update across all mounted views without manual state synchronizations.

### How Does the Frontend Prevent Non-Admins From Accessing Approval Controls?

Role checking occurs at both the route/UI layer and the backend layer. In `EventDetailPage.tsx`, admin review banners and approval buttons are rendered conditionally: `isAdmin && event.status === "PENDING_APPROVAL"`. Even if a user attempts to manually trigger the underlying API endpoint, the backend `authorize("ADMIN")` middleware rejects unauthorized requests with a `403 Forbidden` response.

---

## 7. Senior Engineering Improvements

### Code Quality

- **Modular Custom Hooks**: Encapsulating query logic inside `useEvents.ts` keeps page components clean and declarative.
- **Form Schema Reusability**: Reusing Zod schemas between frontend form validations and backend DTOs enforces consistent data contracts across the stack.

### User Experience

- **Honest Feedback**: Form inputs display explicit error messages, and registration buttons change state to "Registering...", "Waitlisted", or "Registered" immediately.
- **Responsive Layout**: Event cards and tables adapt seamlessly across desktop and mobile screen sizes.
