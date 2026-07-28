import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { LoginPage } from "../features/auth/pages/LoginPage";

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

describe("LoginPage", () => {
  it("renders login form fields and action button", () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders navigation link to registration", () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    expect(screen.getByRole("link", { name: /create account/i })).toBeInTheDocument();
  });
});
