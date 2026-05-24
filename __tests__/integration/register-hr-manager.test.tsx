/**
 * Integration tests — HR Manager Registration Flow
 * Tests: C1-C5
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
import { RegisterFormHrManager } from "@/components/auth/register-form-hr-manager";

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

/** Fill and submit the HR Manager form */
async function fillHrmFormAndSubmit(overrides: Record<string, string> = {}) {
  const user = userEvent.setup();
  const data = {
    fullName: "Jane Manager",
    phoneNumber: "0901234567",
    email: "jane.manager@acme.com",
    department: "HR",
    address: "456 Business Ave",
    password: "Password1",
    confirmPassword: "Password1",
    companyName: "Acme Corp",
    companyAddress: "789 Corporate Blvd",
    companySize: "50-200",
    companyWebsite: "",
    companyDescription: "",
    ...overrides,
  };
  await user.type(screen.getByPlaceholderText("Jane Doe"), data.fullName);
  await user.type(
    screen.getByPlaceholderText("+84 901 234 567"),
    data.phoneNumber,
  );
  await user.type(screen.getByPlaceholderText("you@company.com"), data.email);
  await user.type(
    screen.getByPlaceholderText("Human Resources"),
    data.department,
  );
  await user.type(screen.getByPlaceholderText("123 Main St"), data.address);
  await user.type(screen.getByLabelText("Password"), data.password);
  await user.type(
    screen.getByLabelText("Confirm Password"),
    data.confirmPassword,
  );
  if (data.companyName)
    await user.type(screen.getByPlaceholderText("Acme Corp"), data.companyName);
  if (data.companySize)
    await user.type(
      screen.getByPlaceholderText("50\u2013200"),
      data.companySize,
    );
  if (data.companyAddress)
    await user.type(
      screen.getByPlaceholderText("456 Business Ave"),
      data.companyAddress,
    );
  await user.click(
    screen.getByRole("button", { name: /create hr manager account/i }),
  );
}

describe("[C] HR Manager Registration", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("C1 — valid HRM form → API called with role:HR_MANAGER + company object → redirect with role=HR_MANAGER", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(
        "https://api.workfitai.uk/auth/register",
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            success: true,
            message: "Registration successful",
            data: { userId: "mock-uid", status: "PENDING_VERIFICATION" },
          });
        },
      ),
    );
    render(<RegisterFormHrManager />);
    await fillHrmFormAndSubmit();
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/OTP|created/i),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/register\/verify-otp\?email=.*&role=HR_MANAGER/,
        ),
      );
      expect(capturedBody).toMatchObject({
        role: "HR_MANAGER",
        hrProfile: expect.objectContaining({ department: expect.any(String) }),
        company: expect.objectContaining({ name: "Acme Corp" }),
      });
    });
  });

  it("C2 — missing companyName → inline Zod error, no API call", async () => {
    const spy = vi.fn();
    server.use(
      http.post("https://api.workfitai.uk/auth/register", () => {
        spy();
        return HttpResponse.json({});
      }),
    );
    render(<RegisterFormHrManager />);
    await fillHrmFormAndSubmit({ companyName: "" });
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("C3 — missing companyAddress → inline Zod error, no API call", async () => {
    const spy = vi.fn();
    server.use(
      http.post("https://api.workfitai.uk/auth/register", () => {
        spy();
        return HttpResponse.json({});
      }),
    );
    render(<RegisterFormHrManager />);
    await fillHrmFormAndSubmit({ companyAddress: "" });
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it("C4 — duplicate email (409) → error toast", async () => {
    server.use(
      http.post("https://api.workfitai.uk/auth/register", () =>
        apiError("Email already registered", 409),
      ),
    );
    render(<RegisterFormHrManager />);
    await fillHrmFormAndSubmit();
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringMatching(/already registered|failed/i),
      );
    });
  });

  it("C5 — network error → error toast", async () => {
    server.use(
      http.post("https://api.workfitai.uk/auth/register", () =>
        HttpResponse.error(),
      ),
    );
    render(<RegisterFormHrManager />);
    await fillHrmFormAndSubmit();
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
  });
});
