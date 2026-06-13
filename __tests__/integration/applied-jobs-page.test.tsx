/**
 * Integration tests — AppliedJobsPageClient
 * Renders the full component tree; MSW intercepts real service HTTP calls.
 * The applicationService is NOT mocked — integration tests exercise the full stack.
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
  mockApplication,
  mockPaginationMeta,
} from "../mocks/handlers";
import AppliedJobsPageClient from "@/components/applied-jobs/applied-jobs-page-client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
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
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("AppliedJobsPageClient", () => {
  it('shows "Loading…" subtitle while fetch is in flight', async () => {
    server.use(
      http.get(`${API}/application/my`, () => new Promise(() => {})), // never resolves
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.getByText("Loading…")).toBeInTheDocument(),
    );
  });

  it("renders application cards and total count after load", async () => {
    const app = mockApplication({ status: "APPLIED" });
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({
          items: [app],
          meta: mockPaginationMeta({ totalElements: 1 }),
        }),
      ),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.getByText("1 application total")).toBeInTheDocument(),
    );
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows error banner when API returns 500", async () => {
    server.use(
      http.get(`${API}/application/my`, () => apiError("Server error", 500)),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(
        screen.getByText(/failed to load applications/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows empty state message when no applications exist", async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({
          items: [],
          meta: mockPaginationMeta({ totalElements: 0 }),
        }),
      ),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.getByText("0 applications total")).toBeInTheDocument(),
    );
    expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
  });

  it("renders all status filter tabs", async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({ items: [], meta: mockPaginationMeta() }),
      ),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
    );
    for (const label of [
      "All",
      "Applied",
      "Reviewing",
      "Interview",
      "Offer",
      "Hired",
      "Rejected",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("clicking a status tab re-fetches with status filter", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({ items: [], meta: mockPaginationMeta() });
      }),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Applied" }));
    await waitFor(() => expect(capturedUrl).toContain("status=APPLIED"));
  });

  it("pagination renders when totalPages > 1", async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({
          items: Array.from({ length: 10 }, (_, i) =>
            mockApplication({ id: `app-${i}` }),
          ),
          meta: mockPaginationMeta({ totalPages: 3, totalElements: 30 }),
        }),
      ),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.getByText("30 applications total")).toBeInTheDocument(),
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows correct plural for multiple applications", async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({
          items: [mockApplication(), mockApplication({ id: "app-002" })],
          meta: mockPaginationMeta({ totalElements: 2 }),
        }),
      ),
    );
    render(<AppliedJobsPageClient />);
    await waitFor(() =>
      expect(screen.getByText("2 applications total")).toBeInTheDocument(),
    );
  });
});
