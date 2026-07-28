import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { EventsListPage } from "../features/events/pages/EventsListPage";
import { authKeys } from "../features/auth/hooks/useAuth";
import { eventKeys } from "../features/events/hooks/useEvents";

const createTestApp = (userPayload?: any, eventsPayload?: any) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  if (userPayload) {
    queryClient.setQueryData(authKeys.me, userPayload);
  }

  if (eventsPayload) {
    queryClient.setQueryData(eventKeys.list({ search: undefined, status: undefined }), eventsPayload);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EventsListPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("EventsListPage", () => {
  it("renders event feed header and search bar", () => {
    render(createTestApp());

    expect(screen.getByText(/What's the Scene on Campus|Campus Events Feed/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by event title/i)).toBeInTheDocument();
  });

  it("renders event items when query data is present", () => {
    const mockUser = { id: "user-1", name: "Alice", email: "alice@example.com", role: "STUDENT", status: "ACTIVE" };
    const mockEvents = {
      data: [
        {
          id: "event-1",
          title: "Robotics Hackathon 2026",
          description: "Build autonomous robots in 24 hours.",
          venue: "Lab 301",
          startsAt: "2026-08-10T10:00:00.000Z",
          endsAt: "2026-08-10T18:00:00.000Z",
          capacity: 50,
          status: "PUBLISHED",
          registrationCount: 12,
          isRegistered: true
        }
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
    };

    render(createTestApp(mockUser, mockEvents));

    expect(screen.getByText("Robotics Hackathon 2026")).toBeInTheDocument();
    expect(screen.getByText(/12 \/ 50 registered/i)).toBeInTheDocument();
  });
});
