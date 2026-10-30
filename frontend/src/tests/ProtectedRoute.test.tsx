import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { authKeys } from "../features/auth/hooks/useAuth";

const createTestApp = (initialRoute: string, userPayload?: any) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  if (userPayload) {
    queryClient.setQueryData(authKeys.me, userPayload);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<div>Login Page Mock</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ProtectedRoute", () => {
  it("redirects to /login when no access token exists in localStorage", () => {
    localStorage.removeItem("campuscene_access_token");
    render(createTestApp("/dashboard"));

    expect(screen.getByText("Login Page Mock")).toBeInTheDocument();
    expect(screen.queryByText("Protected Dashboard Content")).not.toBeInTheDocument();
  });

  it("renders protected content when access token exists and user query succeeds", () => {
    localStorage.setItem("campuscene_access_token", "mock-access-token");
    const mockUser = { id: "user-1", name: "Alice", email: "alice@example.com", role: "STUDENT", status: "ACTIVE" };
    render(createTestApp("/dashboard", mockUser));

    expect(screen.getByText("Protected Dashboard Content")).toBeInTheDocument();
  });
});
