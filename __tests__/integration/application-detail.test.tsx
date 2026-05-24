/**
 * Integration tests — ApplicationDetailClient
 * Renders the full component tree; MSW intercepts real service HTTP calls.
 * Only downloadCv is spied on (it does DOM manipulation not available in jsdom).
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
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
  mockApplicationDetail,
  mockStatusHistoryItem,
} from "../mocks/handlers";
import { applicationService } from "@/lib/application/application-service";
import ApplicationDetailClient from "@/components/applied-jobs/application-detail-client";

const API = "https://api.workfitai.uk";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
beforeEach(() =>
  vi.spyOn(applicationService, "downloadCv").mockResolvedValue(undefined),
);
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

function setupHandlers(
  detail = mockApplicationDetail(),
  history: ReturnType<typeof mockStatusHistoryItem>[] = [
    mockStatusHistoryItem(),
  ],
) {
  server.use(
    http.get(`${API}/application/${detail.id}`, () => apiSuccess(detail)),
    http.get(`${API}/application/${detail.id}/history`, () =>
      apiSuccess(history),
    ),
  );
}

describe("ApplicationDetailClient", () => {
  it("shows skeleton while loading", async () => {
    server.use(
      http.get(`${API}/application/app-001`, () => new Promise(() => {})),
    );
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(
        document.querySelectorAll('[data-slot="skeleton"]').length,
      ).toBeGreaterThan(0),
    );
  });

  it("renders job title and company name after load", async () => {
    setupHandlers(mockApplicationDetail({ status: "APPLIED" }));
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText("Frontend Engineer")).toBeInTheDocument(),
    );
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);
  });

  it("renders status badge", async () => {
    setupHandlers(mockApplicationDetail({ status: "REVIEWING" }));
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText("Reviewing")).toBeInTheDocument(),
    );
  });

  it("renders salary range from job snapshot", async () => {
    setupHandlers(mockApplicationDetail());
    render(<ApplicationDetailClient applicationId="app-001" />);
    // Snapshot has salaryMin=2000, salaryMax=4000
    await waitFor(() => expect(screen.getByText(/2,000/)).toBeInTheDocument());
    expect(screen.getByText(/4,000/)).toBeInTheDocument();
  });

  it("renders status history count badge and entries", async () => {
    const history = [
      mockStatusHistoryItem({ newStatus: "APPLIED", changedBy: "system" }),
      mockStatusHistoryItem({
        newStatus: "REVIEWING",
        previousStatus: "APPLIED",
        changedBy: "hr@acme.com",
      }),
    ];
    setupHandlers(mockApplicationDetail(), history);
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText("Status History")).toBeInTheDocument(),
    );
    // Count badge shows number of history items
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it('shows "No status changes yet" when history is empty', async () => {
    setupHandlers(mockApplicationDetail(), []);
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText(/no status changes yet/i)).toBeInTheDocument(),
    );
  });

  it("shows withdraw button for APPLIED status", async () => {
    setupHandlers(mockApplicationDetail({ status: "APPLIED" }), []);
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /withdraw application/i }),
      ).toBeInTheDocument(),
    );
  });

  it("hides withdraw button for HIRED status", async () => {
    setupHandlers(mockApplicationDetail({ status: "HIRED" }), []);
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText("Frontend Engineer")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /withdraw application/i }),
    ).not.toBeInTheDocument();
  });

  it("calls downloadCv when CV filename button is clicked", async () => {
    const detail = mockApplicationDetail({ cvFileName: "my-resume.pdf" });
    setupHandlers(detail, []);
    render(<ApplicationDetailClient applicationId={detail.id} />);
    await waitFor(() =>
      expect(screen.getByText("my-resume.pdf")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByText("my-resume.pdf"));
    await waitFor(() =>
      expect(applicationService.downloadCv).toHaveBeenCalledWith(
        detail.id,
        "my-resume.pdf",
      ),
    );
  });

  it("shows error message when detail fetch fails", async () => {
    server.use(
      http.get(`${API}/application/app-001`, () => apiError("Not found", 404)),
      http.get(`${API}/application/app-001/history`, () => apiSuccess([])),
    );
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(
        screen.getByText(/failed to load application details/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/back to my applications/i)).toBeInTheDocument();
  });

  it("shows not-found state for empty applicationId", async () => {
    render(<ApplicationDetailClient applicationId="" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText(/application not found/i)).toBeInTheDocument();
  });

  it('"Back to My Applications" link points to /applied-jobs', async () => {
    server.use(
      http.get(`${API}/application/app-001`, () => apiError("Not found", 404)),
      http.get(`${API}/application/app-001/history`, () => apiSuccess([])),
    );
    render(<ApplicationDetailClient applicationId="app-001" />);
    await waitFor(() =>
      expect(screen.getByText(/back to my applications/i)).toBeInTheDocument(),
    );
    const link = screen.getByRole("link", { name: /back to my applications/i });
    expect(link).toHaveAttribute("href", "/applied-jobs");
  });
});
