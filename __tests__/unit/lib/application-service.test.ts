/**
 * Unit tests — applicationService
 * Verifies each method calls the correct URL/method with correct params.
 * MSW intercepts all HTTP; no real network calls.
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
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import {
  apiSuccess,
  mockApplication,
  mockApplicationDetail,
  mockPaginationMeta,
  mockStatusHistoryItem,
  mockSubmitApplicationData,
} from "../../mocks/handlers";
import { applicationService } from "@/lib/application/application-service";
import { apiClient } from "@/lib/api-client";

const API = "https://api.workfitai.uk";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

// ── getMyApplications ─────────────────────────────────────────────────────

describe("getMyApplications", () => {
  it("default params — sends page=0, size=20, DESC sort", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({
          items: [mockApplication()],
          meta: mockPaginationMeta(),
        });
      }),
    );
    await applicationService.getMyApplications();
    expect(capturedUrl).toContain("page=0");
    expect(capturedUrl).toContain("size=20");
    expect(capturedUrl).toContain("sortDirection=DESC");
  });

  it("passes status filter in query string", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({
          items: [],
          meta: mockPaginationMeta({ totalElements: 0 }),
        });
      }),
    );
    await applicationService.getMyApplications(0, 10, "APPLIED");
    expect(capturedUrl).toContain("status=APPLIED");
  });

  it("converts page offset correctly — page 2 → page=2 (raw passthrough)", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({ items: [], meta: mockPaginationMeta() });
      }),
    );
    await applicationService.getMyApplications(2, 10);
    expect(capturedUrl).toContain("page=2");
  });

  it("returns items and meta from response", async () => {
    const item = mockApplication({ status: "REVIEWING" });
    const meta = mockPaginationMeta({ totalElements: 3, totalPages: 1 });
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({ items: [item], meta }),
      ),
    );
    const res = await applicationService.getMyApplications();
    expect(res.data?.items[0].status).toBe("REVIEWING");
    expect(res.data?.meta.totalElements).toBe(3);
  });
});

// ── getApplicationById ────────────────────────────────────────────────────

describe("getApplicationById", () => {
  it("calls /application/{id} and returns detail", async () => {
    const detail = mockApplicationDetail({ id: "test-id-42" });
    server.use(
      http.get(`${API}/application/test-id-42`, () => apiSuccess(detail)),
    );
    const res = await applicationService.getApplicationById("test-id-42");
    expect(res.data?.id).toBe("test-id-42");
  });
});

// ── getApplicationCount ───────────────────────────────────────────────────

describe("getApplicationCount", () => {
  it("calls /application/my/count and returns totalApplications", async () => {
    server.use(
      http.get(`${API}/application/my/count`, () =>
        apiSuccess({ totalApplications: 7 }),
      ),
    );
    const res = await applicationService.getApplicationCount();
    expect(res.data?.totalApplications).toBe(7);
  });
});

// ── withdrawApplication ───────────────────────────────────────────────────

describe("withdrawApplication", () => {
  it("sends DELETE /application/{id}", async () => {
    let method = "";
    let capturedPath = "";
    server.use(
      // Return JSON body so apiClient can parse response (avoids 204 empty-body parse issue)
      http.delete(`${API}/application/app-xyz`, ({ request }) => {
        method = request.method;
        capturedPath = new URL(request.url).pathname;
        return HttpResponse.json({ success: true, message: "Withdrawn" });
      }),
    );
    await applicationService.withdrawApplication("app-xyz");
    expect(method).toBe("DELETE");
    expect(capturedPath).toBe("/application/app-xyz");
  });
});

// ── checkApplied ──────────────────────────────────────────────────────────

describe("checkApplied", () => {
  it("sends jobId as query param", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/check`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({ applied: false });
      }),
    );
    await applicationService.checkApplied("job-abc");
    expect(capturedUrl).toContain("jobId=job-abc");
  });

  it("returns applied:true with applicationId when already applied", async () => {
    server.use(
      http.get(`${API}/application/check`, () =>
        apiSuccess({
          applied: true,
          applicationId: "app-001",
          status: "APPLIED",
        }),
      ),
    );
    const res = await applicationService.checkApplied("job-abc");
    expect(res.data?.applied).toBe(true);
    expect(res.data?.applicationId).toBe("app-001");
  });
});

// ── getStatusHistory ──────────────────────────────────────────────────────

describe("getStatusHistory", () => {
  it("calls /application/{id}/history and returns items", async () => {
    const history = [mockStatusHistoryItem({ newStatus: "REVIEWING" })];
    server.use(
      http.get(`${API}/application/app-001/history`, () => apiSuccess(history)),
    );
    const res = await applicationService.getStatusHistory("app-001");
    expect(res.data?.[0].newStatus).toBe("REVIEWING");
  });
});

// ── getVisibleNotes ───────────────────────────────────────────────────────

describe("getVisibleNotes", () => {
  it("calls /application/{id}/notes and returns notes", async () => {
    server.use(
      http.get(`${API}/application/app-001/notes`, () =>
        apiSuccess({
          notes: [
            {
              id: "n1",
              author: "hr",
              content: "Good candidate",
              createdAt: "2026-01-15T08:00:00Z",
            },
          ],
        }),
      ),
    );
    const res = await applicationService.getVisibleNotes("app-001");
    expect(res.data?.notes[0].id).toBe("n1");
  });
});

// ── submitApplication ─────────────────────────────────────────────────────

describe("submitApplication", () => {
  it("calls apiClient.upload with correct FormData fields", async () => {
    const mockData = mockSubmitApplicationData();
    const uploadSpy = vi.spyOn(apiClient, "upload").mockResolvedValueOnce({
      success: true,
      message: "OK",
      data: mockData,
    } as never);
    const file = new File(["%PDF-1.4"], "resume.pdf", {
      type: "application/pdf",
    });
    const result = await applicationService.submitApplication(
      "job-001",
      "test@example.com",
      file,
      "Great cover letter",
    );

    expect(uploadSpy).toHaveBeenCalledWith(
      "/application",
      expect.any(FormData),
    );
    const formData = uploadSpy.mock.calls[0][1] as FormData;
    expect(formData.get("jobId")).toBe("job-001");
    expect(formData.get("email")).toBe("test@example.com");
    expect(formData.get("cvPdfFile")).toBeInstanceOf(File);
    expect(formData.get("coverLetter")).toBe("Great cover letter");
    expect(result.data?.applicationId).toBe("app-001");
  });

  it("omits coverLetter field when not provided", async () => {
    const uploadSpy = vi.spyOn(apiClient, "upload").mockResolvedValueOnce({
      success: true,
      message: "OK",
      data: mockSubmitApplicationData(),
    } as never);
    const file = new File(["%PDF-1.4"], "resume.pdf", {
      type: "application/pdf",
    });
    await applicationService.submitApplication(
      "job-001",
      "test@example.com",
      file,
    );

    const formData = uploadSpy.mock.calls[0][1] as FormData;
    expect(formData.get("coverLetter")).toBeNull();
  });
});

// ── downloadCv — error path ───────────────────────────────────────────────

describe("downloadCv", () => {
  it("throws when response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 403, statusText: "Forbidden" }),
    );
    await expect(applicationService.downloadCv("app-001")).rejects.toThrow(
      "CV download failed (403)",
    );
  });
});
