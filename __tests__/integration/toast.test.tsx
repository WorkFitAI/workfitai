/**
 * Toast behavior tests — Sonner (sonner library)
 *
 * Strategy: vi.mock('sonner') to capture toast calls.
 * vi.mock('@/contexts/auth-context') to control login outcome.
 * Render LoginForm with RTL and assert the right toast is fired.
 *
 * Test IDs mapped to plan: D1, D5, D6, D7, D9
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";

// ── Hoist all mock fns so they're available inside vi.mock factories ───────
const { toastSuccess, toastError, mockLogin } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockLogin: vi.fn(),
}));

// ── Capture toast calls ────────────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// ── Control login outcome via auth-context mock ────────────────────────────
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fills in the login form (valid credentials) and clicks submit.
 * Accepts an optional override for the password field.
 */
async function submitLoginForm(password = "Password1") {
  const user = userEvent.setup();
  await user.type(
    screen.getByPlaceholderText(/email address/i),
    "user@test.com",
  );
  await user.type(screen.getByPlaceholderText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /login/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Sonner toast — LoginForm", () => {
  it("shows success toast on successful login", async () => {
    mockLogin.mockResolvedValueOnce(undefined); // login succeeds
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/sign(ed)? in|success/i),
      );
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows error toast with message on login failure (wrong password)", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("shows error toast when account is not verified (401)", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Account not verified"));
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Account not verified");
    });
  });

  it("shows error toast when account is pending approval (403)", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Account pending approval"));
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Account pending approval");
    });
  });

  it("shows error toast on rate limit (429)", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Too many login attempts"));
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Too many login attempts");
    });
  });

  it("shows fallback error toast when error has no message", async () => {
    mockLogin.mockRejectedValueOnce("unexpected"); // not an Error instance
    render(<LoginForm />);
    await submitLoginForm();
    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Sign in failed");
    });
  });

  it("does NOT fire toast on Zod validation error (empty form)", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    // Click submit without filling fields
    await user.click(screen.getByRole("button", { name: /login/i }));
    // Zod validation blocks form submission — no toast
    await waitFor(() => expect(mockLogin).not.toHaveBeenCalled());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});
