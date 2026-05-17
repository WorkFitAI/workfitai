/**
 * Unit tests for hooks/useCVs.ts
 * Schema aligned with actual API response (meta.result, meta.pages, 0-indexed pagination).
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { apiSuccess, apiError } from "../../mocks/handlers";
import { useCVs } from "@/hooks/useCVs";
import { setSessionCookie } from "@/lib/auth/session-cookie";
import type { CVMetadata, CVListResponse } from "@/types/cv";

const API = "https://be.workfitai.uk";

function mockCVMetadata(overrides: Partial<CVMetadata> = {}): CVMetadata {
  return {
    cvId: "cv-001",
    objectName: "dae8124e-9878-4582-9497-ac4ff22258b9-resume.pdf",
    headline: null,
    summary: "",
    pdfUrl:
      "http://minio:9000/cvs-files/dae8124e-9878-4582-9497-ac4ff22258b9-resume.pdf",
    belongTo: "testuser",
    templateType: "UPLOAD",
    sections: {
      skills: [],
      projects: [],
      education: [],
      languages: [],
      experience: [],
    },
    createdAt: "2026-01-15 08:00:00 AM",
    createdBy: "testuser@example.com",
    updatedAt: "2026-01-15 08:00:00 AM",
    updatedBy: "testuser@example.com",
    exist: true,
    ...overrides,
  };
}

function mockCVListResponse(
  overrides: Partial<CVListResponse> = {},
): CVListResponse {
  return {
    meta: { page: 0, pageSize: 10, pages: 1, total: 1 },
    result: [mockCVMetadata()],
    ...overrides,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  document.cookie = "auth_session=; path=/; max-age=0; SameSite=Lax";
});
afterAll(() => server.close());

function setupSession() {
  setSessionCookie({
    username: "testuser",
    roles: ["ROLE_CANDIDATE"],
    expiresAt: Date.now() + 3600000,
  });
}

describe("useCVs", () => {
  describe("loading state", () => {
    it("initializes with loading=true", () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () => new Promise(() => {})),
      );

      const { result } = renderHook(() => useCVs(0));

      expect(result.current.loading).toBe(true);
      expect(result.current.cvs).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it("sets loading=false after fetch completes", async () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () =>
          apiSuccess(mockCVListResponse()),
        ),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  describe("success state", () => {
    it("fetches CVs on mount — page 0 sent as page=0", async () => {
      setupSession();
      let capturedUrl = "";
      server.use(
        http.get(`${API}/cv/candidate/testuser`, ({ request }) => {
          capturedUrl = request.url;
          return apiSuccess(mockCVListResponse());
        }),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(capturedUrl).toContain("page=0");
      expect(result.current.cvs).toHaveLength(1);
      expect(result.current.cvs[0].cvId).toBe("cv-001");
    });

    it("populates totalPages and total from meta", async () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () =>
          apiSuccess(
            mockCVListResponse({
              meta: { page: 0, pageSize: 10, pages: 3, total: 25 },
              result: [
                mockCVMetadata({ cvId: "cv-001" }),
                mockCVMetadata({ cvId: "cv-002" }),
              ],
            }),
          ),
        ),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.total).toBe(25);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.cvs).toHaveLength(2);
    });

    it("passes page 1 directly to API (0-indexed second page)", async () => {
      setupSession();
      let capturedUrl = "";
      server.use(
        http.get(`${API}/cv/candidate/testuser`, ({ request }) => {
          capturedUrl = request.url;
          return apiSuccess(
            mockCVListResponse({
              result: [mockCVMetadata({ cvId: "cv-011" })],
            }),
          );
        }),
      );

      const { result } = renderHook(() => useCVs(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(capturedUrl).toContain("page=1");
      expect(result.current.cvs[0].cvId).toBe("cv-011");
    });

    it("handles empty CV list", async () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () =>
          apiSuccess(
            mockCVListResponse({
              meta: { page: 0, pageSize: 10, pages: 0, total: 0 },
              result: [],
            }),
          ),
        ),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.cvs).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.error).toBe(null);
    });
  });

  describe("error state", () => {
    it("sets error message on API failure", async () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () =>
          apiError("Internal error", 500),
        ),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/failed to load/i);
      expect(result.current.cvs).toEqual([]);
    });

    it("preserves loading=false after error", async () => {
      setupSession();
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () =>
          apiError("Server error", 500),
        ),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("page changes", () => {
    it("refetches when page prop changes", async () => {
      setupSession();
      let callCount = 0;
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () => {
          callCount++;
          return apiSuccess(mockCVListResponse());
        }),
      );

      const { rerender } = renderHook(({ page }) => useCVs(page), {
        initialProps: { page: 0 },
      });

      await waitFor(() => expect(callCount).toBe(1));

      rerender({ page: 1 });

      await waitFor(() => expect(callCount).toBe(2));
    });
  });

  describe("refresh method", () => {
    it("refresh() re-triggers fetch with same page", async () => {
      setupSession();
      let callCount = 0;
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () => {
          callCount++;
          return apiSuccess(mockCVListResponse());
        }),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(callCount).toBe(1);

      result.current.refresh();

      await waitFor(() => expect(callCount).toBe(2));
    });

    it("refresh() clears error on success", async () => {
      setupSession();
      let callCount = 0;
      server.use(
        http.get(`${API}/cv/candidate/testuser`, () => {
          callCount++;
          return callCount === 1
            ? apiError("Network error", 500)
            : apiSuccess(mockCVListResponse());
        }),
      );

      const { result } = renderHook(() => useCVs(0));

      await waitFor(() => expect(result.current.error).toBeTruthy());

      result.current.refresh();

      await waitFor(() => expect(result.current.error).toBe(null));
      expect(result.current.cvs).toHaveLength(1);
    });
  });
});
