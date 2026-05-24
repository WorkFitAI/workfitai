/**
 * Integration tests — MyCVsPageClient
 * MSW intercepts CV service HTTP calls; session cookie is set for auth.
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
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { mockCVMetadata, mockCVListResponse } from "../mocks/handlers";
import { setSessionCookie } from "@/lib/auth/session-cookie";
import MyCVsPageClient from "@/components/my-cvs/my-cvs-page-client";

const API = "https://api.workfitai.uk";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/my-cvs",
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

function setupSession() {
  setSessionCookie({
    username: "testuser",
    roles: ["ROLE_CANDIDATE"],
    expiresAt: Date.now() + 3_600_000,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  document.cookie = "auth_session=; path=/; max-age=0; SameSite=Lax";
});
afterAll(() => server.close());

describe("MyCVsPageClient", () => {
  it("renders uploaded CVs from the API", async () => {
    setupSession();

    render(<MyCVsPageClient />);

    await waitFor(() =>
      expect(screen.getByText(/1 CV uploaded/i)).toBeInTheDocument(),
    );
  });

  it("shows CV count as 0 when list is empty", async () => {
    setupSession();
    server.use(
      http.get(`${API}/cv/candidate/:username`, () =>
        HttpResponse.json({
          data: mockCVListResponse({
            result: [],
            meta: { page: 0, pageSize: 10, pages: 0, total: 0 },
          }),
        }),
      ),
    );

    render(<MyCVsPageClient />);

    await waitFor(() =>
      expect(screen.getByText(/0 CVs uploaded/i)).toBeInTheDocument(),
    );
  });

  it("shows multiple CVs with correct count", async () => {
    setupSession();
    const twoCVs = [
      mockCVMetadata({ cvId: "cv-001", objectName: "resume-1.pdf" }),
      mockCVMetadata({ cvId: "cv-002", objectName: "resume-2.pdf" }),
    ];
    server.use(
      http.get(`${API}/cv/candidate/:username`, () =>
        HttpResponse.json({
          data: mockCVListResponse({
            result: twoItems,
            meta: { page: 0, pageSize: 10, pages: 1, total: 2 },
          }),
        }),
      ),
    );
    const twoItems = twoCVs;

    render(<MyCVsPageClient />);

    await waitFor(() =>
      expect(screen.getByText(/2 CVs uploaded/i)).toBeInTheDocument(),
    );
  });

  it("shows an error when not authenticated (no session)", async () => {
    // No session set — useCVs short-circuits with auth error
    render(<MyCVsPageClient />);

    await waitFor(() =>
      expect(screen.getByText(/not authenticated/i)).toBeInTheDocument(),
    );
  });

  it("renders the upload dialog button", async () => {
    setupSession();

    render(<MyCVsPageClient />);

    // Upload button / dialog trigger should be visible regardless of data state
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /upload/i }),
      ).toBeInTheDocument(),
    );
  });
});
