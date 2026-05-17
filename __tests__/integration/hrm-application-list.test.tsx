/**
 * Integration tests — HrmApplicationsClient
 * Renders the full component tree; MSW intercepts real applicationService HTTP calls.
 * Tests company application listing, search filtering, and error states.
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
import {
  apiSuccess,
  apiError,
  mockCompanyApplication,
  mockHRUser,
  mockPaginationMeta,
} from "../mocks/handlers";
import HrmApplicationsClient from "@/app/(control)/applications/hrm-applications-client";

const API = "https://be.workfitai.uk";

// Auth context mock — must match AuthContextValue shape from contexts/auth-context.tsx
const mockAuthFn = vi.fn();
vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockAuthFn(),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

/** Default HR manager session with company */
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

/** Register MSW handlers for the two endpoints HrmApplicationsClient fetches */
function setupApplicationHandlers(
  applications = [mockCompanyApplication()],
  hrUsers = [mockHRUser()],
  meta = mockPaginationMeta({ totalElements: applications.length }),
) {
  server.use(
    http.get(`${API}/application/company/C001`, () =>
      apiSuccess({ items: applications, meta }),
    ),
    http.get(`${API}/application/company/C001/hr-users`, () =>
      apiSuccess(hrUsers),
    ),
  );
}

describe("HrmApplicationsClient", () => {
  it("renders the Applications heading after load", async () => {
    asHrManager();
    setupApplicationHandlers();
    render(<HrmApplicationsClient />);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /applications/i }),
      ).toBeInTheDocument(),
    );
  });

  it("shows candidate username in the application table after load", async () => {
    asHrManager();
    const app = mockCompanyApplication({
      username: "johndoe",
      fullName: "John Doe",
    });
    setupApplicationHandlers([app]);
    render(<HrmApplicationsClient />);
    // Table should contain the candidate's identifier (username or fullName depending on column)
    await waitFor(() =>
      expect(
        screen.getByText("johndoe") || screen.getByText("John Doe"),
      ).toBeInTheDocument(),
    );
  });

  it("shows application status badge in the table", async () => {
    asHrManager();
    const app = mockCompanyApplication({ status: "REVIEWING" });
    setupApplicationHandlers([app]);
    render(<HrmApplicationsClient />);
    await waitFor(() =>
      // Status badge text depends on the ApplicationTable component — match case-insensitively
      expect(screen.getByText(/reviewing/i)).toBeInTheDocument(),
    );
  });

  it("client-side search filters applications by candidate username", async () => {
    asHrManager();
    const apps = [
      mockCompanyApplication({ id: "app-001", username: "alice" }),
      mockCompanyApplication({ id: "app-002", username: "bob" }),
    ];
    setupApplicationHandlers(
      apps,
      [mockHRUser()],
      mockPaginationMeta({ totalElements: 2 }),
    );
    render(<HrmApplicationsClient />);
    // Wait for table to populate
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());

    // Type into the search box (placeholder: "Search candidate or job…")
    const searchInput = screen.getByPlaceholderText(/search candidate or job/i);
    await userEvent.type(searchInput, "alice");

    // bob should no longer be visible, alice should remain
    await waitFor(() =>
      expect(screen.queryByText("bob")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("shows error banner when the company applications API returns 500", async () => {
    asHrManager();
    server.use(
      http.get(`${API}/application/company/C001`, () =>
        apiError("Internal server error", 500),
      ),
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([]),
      ),
    );
    render(<HrmApplicationsClient />);
    await waitFor(() =>
      expect(
        screen.getByText(/failed to load applications/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows no-company fallback when user has no companyId", async () => {
    mockAuthFn.mockReturnValue({
      user: {
        username: "orphan",
        email: "orphan@example.com",
        roles: ["ROLE_HR_MANAGER"] as const,
        companyId: null,
        expiresAt: Date.now() + 900_000,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<HrmApplicationsClient />);
    await waitFor(() =>
      expect(
        screen.getByText(/no company associated with your account/i),
      ).toBeInTheDocument(),
    );
  });
});
