import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Login } from "@pages/Login/Login";
import userEvent from "@testing-library/user-event";

const navigateMock = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  Link: () => <a href="/register">Sign up</a>,
}));

const loginMutateMock = vi.fn();

vi.mock('@hooks/api/useAuth', () => ({
  useLogin: () => ({
    mutate: loginMutateMock,
    isPending: false,
    error: null,
  }),
}));

// Clean up mocks after each test so they don't interfere with each other
afterEach(() => {
  vi.clearAllMocks();
});

// ----------------------------------------------------------------------
// 2. THE TEST
// ----------------------------------------------------------------------

describe("Login Component", () => {
  it("renders welcome message", () => {
    render(<Login />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();

     expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should show validation errors for invalid input (Client-side)", async () => {
    const user = userEvent.setup();

    render(<Login />);

    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    await user.click(submitBtn);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await user.type(emailInput, "invalid-email");
    await user.click(submitBtn);

    expect(screen.getByText("Invalid email address")).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText(/password/i);
    await user.type(passwordInput, "123");
    await user.click(submitBtn);

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });
});
