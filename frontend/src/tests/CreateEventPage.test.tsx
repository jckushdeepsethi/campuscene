import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { CreateEventPage } from "../features/events/pages/CreateEventPage";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("CreateEventPage", () => {
  it("renders event creation form fields", () => {
    render(<CreateEventPage />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/annual tech symposium/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe the event/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/main auditorium/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish event|submit for admin|create event/i })).toBeInTheDocument();
  });
});
