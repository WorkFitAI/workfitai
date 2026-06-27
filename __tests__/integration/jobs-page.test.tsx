/**
 * Integration tests — JobsPageClient
 * MSW intercepts real jobService HTTP calls; next/navigation is stubbed.
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
import { http } from "msw";
import { server } from "../mocks/server";
import { apiStatusSuccess, mockJobItem } from "../mocks/handlers";
import JobsPageClient from "@/components/jobs/jobs-page-client";

const API = "https://be.workfitai.uk";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("@/contexts/apply-modal-context", () => ({
  useApplyModal: () => ({ openModal: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
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
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("JobsPageClient", () => {
  it("renders job titles fetched from the API", async () => {
    render(<JobsPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  it("shows loading state then job list", async () => {
    render(<JobsPageClient />);

    // Loading text appears immediately
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Jobs appear after fetch
    await waitFor(() =>
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument(),
    );
  });

  it("renders zero jobs when API returns empty list", async () => {
    server.use(
      http.get(`${API}/job/public/jobs`, () =>
        apiStatusSuccess({
          result: [],
          meta: { page: 0, pageSize: 12, pages: 0, total: 0 },
        }),
      ),
    );

    render(<JobsPageClient />);

    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { level: 2, name: /no jobs found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset filters/i }),
    ).toBeInTheDocument();
  });

  it("shows company name for each job card", async () => {
    render(<JobsPageClient />);

    await waitFor(() =>
      expect(screen.getAllByText("Tech Corp")).toHaveLength(2),
    );
  });

  it("renders pagination when there are multiple pages", async () => {
    server.use(
      http.get(`${API}/job/public/jobs`, () =>
        apiStatusSuccess({
          result: [mockJobItem()],
          meta: { page: 0, pageSize: 12, pages: 3, total: 30 },
        }),
      ),
    );

    render(<JobsPageClient />);

    await waitFor(() =>
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument(),
    );
    // Pagination links should be rendered for pages 1, 2, 3
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
