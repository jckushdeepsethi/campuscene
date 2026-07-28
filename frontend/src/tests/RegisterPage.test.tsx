import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { RegisterPage } from "../features/auth/pages/RegisterPage";

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

describe("RegisterPage", () => {
  it("renders registration form inputs and role options", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("contains all role options", () => {
    render(<RegisterPage />, { wrapper: createWrapper() });

    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent("Student");
    expect(select).toHaveTextContent("Society / Club");
    expect(select).toHaveTextContent("Placement Cell");
    expect(select).toHaveTextContent("University Admin");
  });
});
