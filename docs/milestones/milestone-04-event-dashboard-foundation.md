# Milestone 4: Event Dashboard Foundation

Date: 2026-07-27

## 1. Development Summary

### What Was Built

This milestone replaced the blank protected dashboard placeholder with a real event-management dashboard shell.

Implemented frontend capabilities:

- Protected `/dashboard` page moved into `frontend/src/features/dashboard/pages/DashboardPage.tsx`.
- Current signed-in user display.
- Role label display for Student, Society, Placement Cell, and Admin users.
- Role-aware dashboard introduction text.
- Role-aware action cards.
- Empty dashboard stats for published events, registrations, pending approvals, and attendance.
- Next event milestone checklist.
- Logout button connected to the existing auth logout mutation.
- Clear messaging that live event data is pending until the event API is implemented.

### Why It Was Built

Authentication was working, but users landed on a mostly empty placeholder after login. The project needed a real dashboard foundation before adding event CRUD, registrations, approvals, and attendance workflows.

### What Problems It Solves

- Gives authenticated users a meaningful post-login experience.
- Establishes the visual structure for the event-management product.
- Shows role-aware actions without claiming the event backend exists yet.
- Creates a dedicated dashboard feature folder for future dashboard expansion.
- Adds logout directly to the authenticated workspace.

### Technologies Used

- React
- TypeScript
- React Router
- TanStack Query auth hooks
- Tailwind CSS
- lucide-react

### Challenges Faced

- The dashboard needed to feel useful while still being honest that event APIs are not implemented yet.
- Role-based UI needed to avoid overbuilding before the database models and backend contracts exist.
- The app needed a better dashboard without inventing fake event data.

### Important Engineering Decisions

- Kept stats at `0` with explicit “API pending” detail text.
- Disabled action buttons until the matching event workflows are implemented.
- Reused the existing `useCurrentUser` and `useLogout` hooks.
- Added the dashboard as a feature module instead of keeping it inline inside the router.
- Kept all live event data out of the UI until the backend event module exists.

### Lessons Learned

- A useful dashboard can be built incrementally without faking data.
- Role-aware UI can start with clear structure and become functional once APIs are added.
- Moving placeholders into real feature folders early keeps the project easier to extend.

## 2. LeetCode Community Post

### Milestone 4: Built the Event Dashboard Foundation

Today I completed the fourth milestone of CampusConnect by replacing the placeholder dashboard with a real event-management dashboard shell.

### What I Built Today

I added:

- A protected event dashboard page.
- Current user display.
- Role-aware dashboard copy.
- Role-aware action cards.
- Empty event stats.
- Next milestone checklist.
- Logout button.
- Clear pending states for event APIs that are not built yet.

### Screenshots

Insert screenshots here:

- Event dashboard as Student.
- Event dashboard as Society / Club.
- Event dashboard as Admin or Placement Cell.

### Technical Concepts Learned

- Protected route composition.
- Role-aware UI rendering.
- Feature-based frontend organization.
- Reusing auth state in a dashboard.
- Designing honest empty states before backend data exists.

### Challenges Overcome

The main challenge was improving the dashboard without pretending event management already works. I solved this by showing useful role-specific structure, but keeping stats empty and action buttons disabled until the event API is implemented.

### What's Coming Next

Next, I plan to build the event-management backend:

- Event database models.
- Event CRUD API.
- Event listing endpoint.
- Event registration flow.
- Admin/event-team approval workflow.

## 3. GitHub README Update

The README has been updated with:

- Milestone 4 status.
- Dashboard feature folder.
- Updated dashboard route status.
- Updated progress checklist.
- Updated roadmap focused on event APIs.
- Link to this milestone journal.

## 4. Git Commit Suggestions

Suggested Conventional Commit messages:

```text
feat: add event dashboard foundation
feat: add role-aware dashboard actions and empty stats
feat: connect dashboard logout action
docs: document milestone 4 event dashboard foundation
docs: update README dashboard progress and roadmap
```

## 5. Resume Notes

Possible ATS-friendly resume bullet:

- Built a protected React event dashboard foundation with role-aware UI, current-user session display, logout behavior, and honest empty states for future event CRUD, registration, approval, and attendance workflows.

## 6. Interview Preparation

### Explain Your Implementation.

I replaced the inline dashboard placeholder with a dedicated `DashboardPage` under a dashboard feature folder. It reads the current authenticated user from the existing auth hook, renders role-specific dashboard text and action cards, displays empty stats, and provides a logout button through the existing logout mutation.

### Why Did You Build the Dashboard Before the Event API?

The dashboard defines the user experience and workflow structure. It helps clarify which backend APIs need to be built next while giving authenticated users a meaningful landing page.

### How Does the Dashboard Know the User Role?

The protected route fetches the current user through `GET /auth/me`. The dashboard uses the same current-user hook and renders UI based on the user's role.

### Why Are the Action Buttons Disabled?

The matching backend event APIs do not exist yet. Disabled buttons make the roadmap visible without claiming unfinished functionality.

### How Would You Connect Live Data Later?

I would add event API methods, React Query hooks for event stats and lists, then replace the static `0` stats and disabled cards with real data and navigation.

### What Improvements Would You Make Next?

I would build event database models, create event CRUD endpoints, add dashboard API hooks, and add frontend tests for dashboard rendering by role.

## 7. Engineering Improvements

### Code Quality

The dashboard now lives in a dedicated feature folder instead of being embedded inside the router.

Suggested improvement:

- Split dashboard cards into reusable components as the page grows.

### Folder Structure

Adding `features/dashboard` establishes a clean place for future authenticated workspace UI.

Suggested improvement:

- Add `features/events` when event APIs and pages are implemented.

### Performance

The dashboard is lightweight, but the Vite build now warns that the JavaScript bundle is slightly above 500 KB.

Suggested improvement:

- Add route-level lazy loading once more dashboard/event pages are added.

### Security

The dashboard remains protected by the existing route guard and uses the authenticated current-user endpoint.

Suggested improvement:

- Add frontend tests to confirm unauthenticated users are redirected to login.

### Scalability

The role-aware structure can evolve into separate dashboards if roles become very different.

Suggested improvement:

- Move role configuration into a separate file if additional roles or actions are added.

### Database Design

No database schema changes were made in this milestone.

Suggested improvement:

- Design event models next, including ownership, approval status, capacity, registration windows, and attendance rules.

### UI/UX

The dashboard is now much more useful after login and clearly explains what is pending.

Suggested improvements:

- Add real navigation when event pages exist.
- Add loading and empty states for live dashboard stats.
- Add a responsive sidebar once there are multiple authenticated pages.

### API Design

No new API endpoints were added in this milestone.

Suggested improvement:

- Build the event API next and keep endpoints role-aware from the start.

### Naming Conventions

The new `DashboardPage` name is clear and consistent with existing page naming.

Suggested improvement:

- Continue using feature-based names such as `EventListPage`, `CreateEventPage`, and `EventDetailPage`.

