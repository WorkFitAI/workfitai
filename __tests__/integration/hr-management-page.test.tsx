/**
 * Integration tests — HrManagementClient
 * Renders the full component tree; MSW intercepts real applicationService HTTP calls.
 * adminUserService (approve/reject) is vi.mock'd because it's a direct mutation.
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
import { http } from "msw";
import { server } from "../mocks/server";
import { apiSuccess, apiError, mockHRUser } from "../mocks/handlers";
import HrManagementClient from "@/app/(control)/hr-management/hr-management-client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk";

// vi.hoisted ensures these refs are available inside vi.mock() factory closures
// (vi.mock is hoisted to the top of the file by Vitest's transform, before const declarations)
const {
  mockAuthFn,
  mockApproveHR,
  mockRejectHR,
  mockToastSuccess,
  mockToastError,
} = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockApproveHR: vi.fn(),
  mockRejectHR: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthFn(),
}));

vi.mock("@/lib/admin/admin-user-service", () => ({
  adminUserService: {
    approveHR: mockApproveHR,
    rejectHR: mockRejectHR,
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

/** Default HR manager session */
function asHrManager() {
  mockAuthFn.mockReturnValue({
    user: {
      username: "hrmanager1",
      email: "hrmanager1@gmail.com",
      roles: ["ROLE_HR_MANAGER"] as const,
      companyId: "C001",
      expiresAt: Date.now() + 900_000,
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
}

describe("HrManagementClient", () => {
  it("shows loading spinner while HR users are being fetched", async () => {
    asHrManager();
    server.use(
      http.get(
        `${API}/application/company/C001/hr-users`,
        () => new Promise(() => {}),
      ),
    );
    render(<HrManagementClient />);
    // Loading row with spinner text should appear
    await waitFor(() =>
      expect(screen.getByText(/loading hr members/i)).toBeInTheDocument(),
    );
  });

  it("renders HR user full name and email after load", async () => {
    asHrManager();
    const hrUser = mockHRUser({ userStatus: "WAIT_APPROVED", userRole: "HR" });
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([hrUser]),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByText("HR Test User 1")).toBeInTheDocument(),
    );
    expect(screen.getByText("hrtest1@gmail.com")).toBeInTheDocument();
  });

  it("shows Approve and Reject buttons for WAIT_APPROVED HR users when logged in as HR_MANAGER", async () => {
    asHrManager();
    const hrUser = mockHRUser({ userStatus: "WAIT_APPROVED", userRole: "HR" });
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([hrUser]),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByText("HR Test User 1")).toBeInTheDocument(),
    );
    // Approve button (title="Approve HR")
    expect(screen.getByTitle("Approve HR")).toBeInTheDocument();
    // Reject button (title="Reject HR")
    expect(screen.getByTitle("Reject HR")).toBeInTheDocument();
  });

  it("clicking Approve calls adminUserService.approveHR with the HR username and shows toast", async () => {
    asHrManager();
    const hrUser = mockHRUser({ userStatus: "WAIT_APPROVED", userRole: "HR" });
    mockApproveHR.mockResolvedValue({});
    // After approve, refresh will re-fetch — return same user for simplicity
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([hrUser]),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByTitle("Approve HR")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByTitle("Approve HR"));

    await waitFor(() => expect(mockApproveHR).toHaveBeenCalledWith("hrtest1"));
    expect(mockToastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("approved"),
    );
  });

  it("clicking Reject calls adminUserService.rejectHR with the HR username and shows toast", async () => {
    asHrManager();
    const hrUser = mockHRUser({ userStatus: "WAIT_APPROVED", userRole: "HR" });
    mockRejectHR.mockResolvedValue({});
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([hrUser]),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByTitle("Reject HR")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByTitle("Reject HR"));

    await waitFor(() => expect(mockRejectHR).toHaveBeenCalledWith("hrtest1"));
    expect(mockToastSuccess).toHaveBeenCalledWith(
      expect.stringContaining("rejected"),
    );
  });

  it("shows error banner when the HR users API returns 500", async () => {
    asHrManager();
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiError("Server error", 500),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByText(/failed to load hr users/i)).toBeInTheDocument(),
    );
  });

  it("shows empty state message when no HR members exist", async () => {
    asHrManager();
    server.use(
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([]),
      ),
    );
    render(<HrManagementClient />);
    await waitFor(() =>
      expect(screen.getByText(/no hr members found/i)).toBeInTheDocument(),
    );
  });
});
