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
  mockHRJobItem,
  mockHRCandidateItem,
  mockCandidateDetail,
  mockPaginationMeta,
} from "../mocks/handlers";
import HrmApplicationsClient from "@/app/(control)/applications/hrm-applications-client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk";

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

/** Register MSW handlers for all endpoints HrmApplicationsClient fetches */
function setupApplicationHandlers(
  applications = [mockCompanyApplication()],
  hrUsers = [mockHRUser()],
  meta = mockPaginationMeta({ totalElements: applications.length }),
  jobs = [mockHRJobItem()],
) {
  server.use(
    http.get(`${API}/application/company/C001`, () =>
      apiSuccess({ items: applications, meta }),
    ),
    http.get(`${API}/application/company/C001/hr-users`, () =>
      apiSuccess(hrUsers),
    ),
    http.get(`${API}/application/company/C001/jobs`, () =>
      apiSuccess({
        items: jobs,
        meta: mockPaginationMeta({ totalElements: jobs.length }),
      }),
    ),
    http.get(`${API}/application/company/C001/candidates`, () =>
      apiSuccess({
        items: [mockHRCandidateItem()],
        meta: mockPaginationMeta(),
      }),
    ),
    http.get(`${API}/application/company/C001/candidates/:username`, () =>
      apiSuccess(mockCandidateDetail()),
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
    // Handler filters by keyword query param (server-side search)
    server.use(
      http.get(`${API}/application/company/C001`, ({ request }) => {
        const keyword = new URL(request.url).searchParams.get("keyword") ?? "";
        const filtered = keyword
          ? apps.filter((a) => a.username.includes(keyword))
          : apps;
        return apiSuccess({
          items: filtered,
          meta: mockPaginationMeta({ totalElements: filtered.length }),
        });
      }),
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([mockHRUser()]),
      ),
      http.get(`${API}/application/company/C001/jobs`, () =>
        apiSuccess({ items: [], meta: mockPaginationMeta() }),
      ),
      http.get(`${API}/application/company/C001/candidates`, () =>
        apiSuccess({ items: [mockHRCandidateItem()], meta: mockPaginationMeta() }),
      ),
    );
    render(<HrmApplicationsClient />);
    // Wait for table to populate
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());

    // Type into the search box (placeholder: "Search candidate or job…")
    const searchInput = screen.getByPlaceholderText(/search candidate or job/i);
    await userEvent.type(searchInput, "alice");

    // bob should no longer be visible after debounce fires and API returns filtered result
    await waitFor(
      () => expect(screen.queryByText("bob")).not.toBeInTheDocument(),
      { timeout: 2000 },
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

  it("renders job filter dropdown populated from the jobs API", async () => {
    asHrManager();
    const job = mockHRJobItem({ jobId: "job-001", title: "Senior React Dev" });
    setupApplicationHandlers(
      [mockCompanyApplication({ jobId: "job-001" })],
      [mockHRUser()],
      undefined,
      [job],
    );
    render(<HrmApplicationsClient />);

    // Wait for applications to load, then check the job filter dropdown
    await waitFor(() =>
      expect(screen.getByText("candidate1")).toBeInTheDocument(),
    );
    const jobSelect = screen.getByDisplayValue("All jobs");
    expect(jobSelect).toBeInTheDocument();
    // The job title should appear as an option in the dropdown
    expect(
      screen.getByRole("option", { name: "Senior React Dev" }),
    ).toBeInTheDocument();
  });

  it("client-side job filter hides applications for other jobs", async () => {
    asHrManager();
    const apps = [
      mockCompanyApplication({
        id: "app-001",
        username: "alice",
        jobId: "job-001",
      }),
      mockCompanyApplication({
        id: "app-002",
        username: "bob",
        jobId: "job-002",
      }),
    ];
    const jobs = [
      mockHRJobItem({ jobId: "job-001", title: "Frontend Dev" }),
      mockHRJobItem({ jobId: "job-002", title: "Backend Dev" }),
    ];
    // Handler filters by jobTitle query param (server-side filtering)
    server.use(
      http.get(`${API}/application/company/C001`, ({ request }) => {
        const jobTitle = new URL(request.url).searchParams.get("jobTitle") ?? "";
        const filtered = jobTitle
          ? apps.filter((a) => {
              const job = jobs.find((j) => j.title === jobTitle);
              return job ? a.jobId === job.jobId : true;
            })
          : apps;
        return apiSuccess({
          items: filtered,
          meta: mockPaginationMeta({ totalElements: filtered.length }),
        });
      }),
      http.get(`${API}/application/company/C001/hr-users`, () =>
        apiSuccess([mockHRUser()]),
      ),
      http.get(`${API}/application/company/C001/jobs`, () =>
        apiSuccess({
          items: jobs,
          meta: mockPaginationMeta({ totalElements: jobs.length }),
        }),
      ),
      http.get(`${API}/application/company/C001/candidates`, () =>
        apiSuccess({ items: [mockHRCandidateItem()], meta: mockPaginationMeta() }),
      ),
    );
    render(<HrmApplicationsClient />);

    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
    expect(screen.getByText("bob")).toBeInTheDocument();

    // Select "Frontend Dev" job filter
    const jobSelect = screen.getByDisplayValue("All jobs");
    await userEvent.selectOptions(jobSelect, "job-001");

    // bob (job-002) should be hidden after server returns filtered result
    await waitFor(
      () => expect(screen.queryByText("bob")).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("can switch to Candidates tab", async () => {
    asHrManager();
    setupApplicationHandlers();
    render(<HrmApplicationsClient />);

    // Wait for initial load
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /applications/i }),
      ).toBeInTheDocument(),
    );

    // Click the Candidates tab
    const candidatesTab = screen.getByRole("button", { name: /candidates/i });
    await userEvent.click(candidatesTab);

    // Candidates tab should show a table with the candidate from the mock
    await waitFor(() =>
      expect(screen.getByText("Candidate One")).toBeInTheDocument(),
    );
  });
});
