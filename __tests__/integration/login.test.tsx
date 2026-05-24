/**
 * Integration tests — Login Flow
 * Tests: D1-D10 from the auth test plan
 * Uses MSW to mock POST /auth/login
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { loginSuccess } from "../mocks/handlers";
import { LoginForm } from "@/components/auth/login-form";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import authReducer from "@/store/auth-slice";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const { mockToastSuccess, mockToastError, mockPush, mockLogin } = vi.hoisted(
  () => ({
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockPush: vi.fn(),
    mockLogin: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

function renderLoginForm() {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <LoginForm />
    </Provider>,
  );
}

async function fillLogin(usernameOrEmail: string, password: string) {
  const user = userEvent.setup();
  await user.type(
    screen.getByPlaceholderText(/email address/i),
    usernameOrEmail,
  );
  await user.type(screen.getByPlaceholderText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /login/i }));
}

describe("[D] Login Form", () => {
  it("D4 — empty form → Zod inline errors, no API call", async () => {
    const spy = vi.fn();
    server.use(
      http.post("https://api.workfitai.uk/auth/login", () => {
        spy();
        return HttpResponse.json({});
      }),
    );
    renderLoginForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("D4b — password too short → Zod inline error", async () => {
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      "user@test.com",
    );
    await user.type(screen.getByPlaceholderText(/password/i), "abc");
    await user.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
    });
  });

  it("D10 — loading spinner visible during submit", async () => {
    // Delay the mock login so the button stays disabled long enough to observe
    mockLogin.mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 150)),
    );
    renderLoginForm();
    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText(/email address/i),
      "user@test.com",
    );
    await user.type(screen.getByPlaceholderText(/password/i), "Password1");
    user.click(screen.getByRole("button", { name: /login/i })); // don't await
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /login/i })).toBeDisabled(),
    );
  });

  it("D — login form renders all fields", () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("D — remember me checkbox toggles", async () => {
    renderLoginForm();
    const user = userEvent.setup();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
