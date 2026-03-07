/**
 * Integration tests — HR Registration Flow
 * Tests: B1-B5
 * Uses MSW to mock POST /auth/register
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
import { apiError } from "../mocks/handlers";
import { RegisterFormHr } from "@/components/auth/register-form-hr";

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// Hoist mocks so vi.mock() factory can reference them
const { mockToastSuccess, mockToastError, mockPush } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: mockToastSuccess, error: mockToastError },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

/** Fill and submit the HR registration form */
async function fillHrFormAndSubmit(overrides: Record<string, string> = {}) {
  const user = userEvent.setup();
  const data = {
    fullName: "Jane HR",
    phoneNumber: "0901234567",
    email: "jane.hr@company.com",
    department: "Engineering",
    address: "123 Main St",
    hrManagerEmail: "manager@company.com",
    password: "Password1",
    confirmPassword: "Password1",
    ...overrides,
  };
  await user.type(screen.getByPlaceholderText("Jane Doe"), data.fullName);
  await user.type(screen.getByPlaceholderText("you@company.com"), data.email);
  await user.type(
    screen.getByPlaceholderText("+84 901 234 567"),
    data.phoneNumber,
  );
  await user.type(screen.getByPlaceholderText("Engineering"), data.department);
  await user.type(screen.getByPlaceholderText("123 Main St"), data.address);
  if (data.hrManagerEmail)
    await user.type(
      screen.getByPlaceholderText("manager@company.com"),
      data.hrManagerEmail,
    );
  await user.type(screen.getByLabelText("Password"), data.password);
  await user.type(
    screen.getByLabelText("Confirm Password"),
    data.confirmPassword,
  );
  await user.click(screen.getByRole("button", { name: /create hr account/i }));
}

describe("[B] HR Registration", () => {
  it("B1 — valid HR form → API called with role:HR + hrProfile → redirect to verify-otp with role=HR", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("http://localhost:9085/auth/register", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: "Registration successful",
          data: { userId: "mock-uid", status: "PENDING_VERIFICATION" },
        });
      }),
    );
    render(<RegisterFormHr />);
    await fillHrFormAndSubmit();
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/OTP|created/i),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/\/register\/verify-otp\?email=.*&role=HR/),
      );
      expect(capturedBody).toMatchObject({
        role: "HR",
        hrProfile: expect.any(Object),
      });
    });
  });

  it("B2 — duplicate email (409) → error toast", async () => {
    server.use(
      http.post("http://localhost:9085/auth/register", () =>
        apiError("Email already registered", 409),
      ),
    );
    render(<RegisterFormHr />);
    await fillHrFormAndSubmit();
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/already registered|failed/i),
      );
    });
  });

  it("B3 — missing hrManagerEmail → inline Zod error, no API call", async () => {
    const spy = vi.fn();
    server.use(
      http.post("http://localhost:9085/auth/register", () => {
        spy();
        return HttpResponse.json({});
      }),
    );
    render(<RegisterFormHr />);
    await fillHrFormAndSubmit({ hrManagerEmail: "" });
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("B4 — password mismatch → inline error, no API call", async () => {
    const spy = vi.fn();
    server.use(
      http.post("http://localhost:9085/auth/register", () => {
        spy();
        return HttpResponse.json({});
      }),
    );
    render(<RegisterFormHr />);
    await fillHrFormAndSubmit({ confirmPassword: "Different1" });
    await waitFor(() => {
      expect(screen.getByText(/match/i)).toBeInTheDocument();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("B5 — network error → error toast", async () => {
    server.use(
      http.post("http://localhost:9085/auth/register", () =>
        HttpResponse.error(),
      ),
    );
    render(<RegisterFormHr />);
    await fillHrFormAndSubmit();
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
  });
});
