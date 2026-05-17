/**
 * Unit tests — applicationService HRM methods
 * Covers: getCompanyApplications, getCompanyHRUsers, updateApplicationStatus,
 *         assignApplication, addApplicationNote, updateApplicationNote, deleteApplicationNote
 * MSW intercepts all HTTP; no real network calls.
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import {
  apiSuccess,
  mockHRUser,
  mockApplicationNote,
  mockPaginationMeta,
  mockCompanyApplication,
} from "../../mocks/handlers";
import { applicationService } from "@/lib/application/application-service";

const API = "https://be.workfitai.uk";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── getCompanyApplications ────────────────────────────────────────────────────

describe("getCompanyApplications", () => {
  it("calls /application/company/:companyNo with page and size params", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/company/:companyNo`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({
          items: [mockCompanyApplication()],
          meta: mockPaginationMeta(),
        });
      }),
    );
    await applicationService.getCompanyApplications("C001", 0, 20);
    expect(capturedUrl).toContain("/application/company/C001");
    expect(capturedUrl).toContain("page=0");
    expect(capturedUrl).toContain("size=20");
  });

  it("uses companyNo in the URL path", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${API}/application/company/:companyNo`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({
          items: [],
          meta: mockPaginationMeta({ totalElements: 0 }),
        });
      }),
    );
    await applicationService.getCompanyApplications("ACME-99");
    expect(capturedUrl).toContain("/application/company/ACME-99");
  });

  it("returns paginated items and meta", async () => {
    const item = mockCompanyApplication({ status: "REVIEWING" });
    const meta = mockPaginationMeta({ totalElements: 3, totalPages: 1 });
    server.use(
      http.get(`${API}/application/company/:companyNo`, () =>
        apiSuccess({ items: [item], meta }),
      ),
    );
    const res = await applicationService.getCompanyApplications("C001");
    expect(res.data?.items[0].status).toBe("REVIEWING");
    expect(res.data?.meta.totalElements).toBe(3);
  });
});

// ── getCompanyHRUsers ─────────────────────────────────────────────────────────

describe("getCompanyHRUsers", () => {
  it("calls /application/company/:companyNo/hr-users", async () => {
    let capturedUrl = "";
    server.use(
      http.get(
        `${API}/application/company/:companyNo/hr-users`,
        ({ request }) => {
          capturedUrl = request.url;
          return apiSuccess([mockHRUser()]);
        },
      ),
    );
    await applicationService.getCompanyHRUsers("C001");
    expect(capturedUrl).toContain("/application/company/C001/hr-users");
  });

  it("returns array of HRUser objects", async () => {
    const hr = mockHRUser({ username: "hrtest1", fullName: "HR Test User 1" });
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () =>
        apiSuccess([hr]),
      ),
    );
    const res = await applicationService.getCompanyHRUsers("C001");
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].username).toBe("hrtest1");
  });
});

// ── updateApplicationStatus ───────────────────────────────────────────────────

describe("updateApplicationStatus", () => {
  it("sends PUT /application/:id/status?status= with correct status value", async () => {
    let capturedUrl = "";
    let capturedMethod = "";
    server.use(
      http.put(`${API}/application/:id/status`, ({ request }) => {
        capturedUrl = request.url;
        capturedMethod = request.method;
        return apiSuccess({ id: "app-001", status: "REVIEWING" });
      }),
    );
    await applicationService.updateApplicationStatus("app-001", "REVIEWING");
    expect(capturedMethod).toBe("PUT");
    expect(capturedUrl).toContain("/application/app-001/status");
    expect(capturedUrl).toContain("status=REVIEWING");
  });

  it("works with any valid status value", async () => {
    let capturedUrl = "";
    server.use(
      http.put(`${API}/application/:id/status`, ({ request }) => {
        capturedUrl = request.url;
        return apiSuccess({ id: "app-002", status: "HIRED" });
      }),
    );
    await applicationService.updateApplicationStatus("app-002", "HIRED");
    expect(capturedUrl).toContain("status=HIRED");
  });
});

// ── assignApplication ─────────────────────────────────────────────────────────

describe("assignApplication", () => {
  it("sends PUT /application/:id/assign with { assignedTo } body", async () => {
    let capturedBody: unknown = null;
    let capturedUrl = "";
    server.use(
      http.put(`${API}/application/:id/assign`, async ({ request }) => {
        capturedUrl = request.url;
        capturedBody = await request.json();
        return apiSuccess({ id: "app-001", assignedTo: "hrtest1" });
      }),
    );
    await applicationService.assignApplication("app-001", "hrtest1");
    expect(capturedUrl).toContain("/application/app-001/assign");
    expect(capturedBody).toEqual({ assignedTo: "hrtest1" });
  });
});

// ── addApplicationNote ────────────────────────────────────────────────────────

describe("addApplicationNote", () => {
  it("sends POST /application/:id/notes with correct body", async () => {
    let capturedBody: unknown = null;
    let capturedUrl = "";
    server.use(
      http.post(`${API}/application/:id/notes`, async ({ request }) => {
        capturedUrl = request.url;
        capturedBody = await request.json();
        return apiSuccess(mockApplicationNote());
      }),
    );
    await applicationService.addApplicationNote(
      "app-001",
      "Great candidate",
      true,
    );
    expect(capturedUrl).toContain("/application/app-001/notes");
    expect(capturedBody).toEqual({
      content: "Great candidate",
      candidateVisible: true,
    });
  });

  it("returns the created note in response data", async () => {
    const note = mockApplicationNote({
      id: "note-new",
      content: "Well qualified",
    });
    server.use(
      http.post(`${API}/application/:id/notes`, () => apiSuccess(note)),
    );
    const res = await applicationService.addApplicationNote(
      "app-001",
      "Well qualified",
      false,
    );
    expect(res.data?.id).toBe("note-new");
    expect(res.data?.content).toBe("Well qualified");
  });
});

// ── updateApplicationNote ─────────────────────────────────────────────────────

describe("updateApplicationNote", () => {
  it("sends PUT /application/:id/notes/:noteId with correct body", async () => {
    let capturedBody: unknown = null;
    let capturedUrl = "";
    server.use(
      http.put(`${API}/application/:id/notes/:noteId`, async ({ request }) => {
        capturedUrl = request.url;
        capturedBody = await request.json();
        return apiSuccess(mockApplicationNote({ content: "Updated note" }));
      }),
    );
    await applicationService.updateApplicationNote(
      "app-001",
      "note-001",
      "Updated note",
      false,
    );
    expect(capturedUrl).toContain("/application/app-001/notes/note-001");
    expect(capturedBody).toEqual({
      content: "Updated note",
      candidateVisible: false,
    });
  });
});

// ── deleteApplicationNote ─────────────────────────────────────────────────────

describe("deleteApplicationNote", () => {
  it("sends DELETE /application/:id/notes/:noteId", async () => {
    let capturedMethod = "";
    let capturedUrl = "";
    server.use(
      http.delete(`${API}/application/:id/notes/:noteId`, ({ request }) => {
        capturedMethod = request.method;
        capturedUrl = request.url;
        return HttpResponse.json({ success: true, message: "Note deleted" });
      }),
    );
    await applicationService.deleteApplicationNote("app-001", "note-001");
    expect(capturedMethod).toBe("DELETE");
    expect(capturedUrl).toContain("/application/app-001/notes/note-001");
  });
});
