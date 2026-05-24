/**
 * Unit tests — useCompanyHRManagement, useApproveHR, useRejectHR hooks
 * from hooks/useHrManagement.ts
 * Also covers: useHRJobs, useHRCandidates, useCompanyJobs, useCompanyCandidates
 * from hooks/useHrmApplications.ts
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import {
  apiSuccess,
  apiError,
  mockHRUser,
  mockHRJobItem,
  mockHRCandidateItem,
  mockPaginationMeta,
} from "../../mocks/handlers";
import {
  useCompanyHRManagement,
  useApproveHR,
  useRejectHR,
} from "@/hooks/useHrManagement";
import {
  useHRJobs,
  useHRCandidates,
  useCompanyJobs,
  useCompanyCandidates,
} from "@/hooks/useHrmApplications";

const API = "https://api.workfitai.uk";

// Mock adminUserService — approve/reject HR call it directly (not via HTTP)
vi.mock("@/lib/admin/admin-user-service", () => ({
  adminUserService: {
    approveHR: vi.fn().mockResolvedValue({ success: true, data: {} }),
    rejectHR: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

// Mock sonner toast so it doesn't throw in test environment
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { adminUserService } from "@/lib/admin/admin-user-service";
import { toast } from "sonner";

const mockAdminUserService = vi.mocked(adminUserService);
const mockToast = vi.mocked(toast);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ── useCompanyHRManagement ────────────────────────────────────────────────────

describe("useCompanyHRManagement", () => {
  it("starts with loading=true then resolves with HR users", async () => {
    const hr = mockHRUser({ username: "hrtest1", fullName: "HR Test User 1" });
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () =>
        apiSuccess([hr]),
      ),
    );
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hrUsers).toHaveLength(1);
    expect(result.current.hrUsers[0].username).toBe("hrtest1");
  });

  it("sets error when API returns failure", async () => {
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () =>
        apiError("Server error", 500),
      ),
    );
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load HR users/i);
    expect(result.current.hrUsers).toHaveLength(0);
  });

  it("does not fetch when companyNo is empty string", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () => {
        callCount++;
        return apiSuccess([mockHRUser()]);
      }),
    );
    renderHook(() => useCompanyHRManagement(""));
    // Give some time for any fetch to potentially fire
    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBe(0);
  });

  it("refresh() re-triggers fetch and updates results", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () => {
        callCount++;
        return apiSuccess([mockHRUser()]);
      }),
    );
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(callCount).toBe(1);

    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(callCount).toBe(2));
  });

  it("returns empty array when API data is null/undefined", async () => {
    server.use(
      http.get(`${API}/application/company/:companyNo/hr-users`, () =>
        HttpResponse.json({ success: true, message: "OK", data: null }),
      ),
    );
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hrUsers).toHaveLength(0);
  });
});

// ── useApproveHR ──────────────────────────────────────────────────────────────

describe("useApproveHR", () => {
  it("calls adminUserService.approveHR with the user username", async () => {
    const { result } = renderHook(() => useApproveHR());
    const user = mockHRUser({
      userId: "u-1",
      username: "hrtest1",
      fullName: "HR Test",
    });

    await act(async () => {
      await result.current.approve(user);
    });

    expect(mockAdminUserService.approveHR).toHaveBeenCalledWith("hrtest1");
  });

  it("sets approvingId during approve call and clears it after", async () => {
    // Make approveHR take a tick so we can observe mid-call state
    let resolveApprove!: () => void;
    mockAdminUserService.approveHR.mockReturnValueOnce(
      new Promise<{ success: boolean; data: unknown }>((res) => {
        resolveApprove = () => res({ success: true, data: {} });
      }),
    );

    const { result } = renderHook(() => useApproveHR());
    const user = mockHRUser({ userId: "u-1", username: "hrtest1" });

    act(() => {
      result.current.approve(user);
    });
    await waitFor(() => expect(result.current.approvingId).toBe("u-1"));

    await act(async () => {
      resolveApprove();
    });
    await waitFor(() => expect(result.current.approvingId).toBeNull());
  });

  it("calls onSuccess callback after successful approval", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useApproveHR(onSuccess));
    const user = mockHRUser();

    await act(async () => {
      await result.current.approve(user);
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows toast.success with user fullName on success", async () => {
    const { result } = renderHook(() => useApproveHR());
    const user = mockHRUser({ fullName: "Jane HR" });

    await act(async () => {
      await result.current.approve(user);
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining("Jane HR"),
    );
  });

  it("sets approveError and calls toast.error when approveHR throws", async () => {
    mockAdminUserService.approveHR.mockRejectedValueOnce(
      new Error("Network failure"),
    );

    const { result } = renderHook(() => useApproveHR());
    const user = mockHRUser();

    await act(async () => {
      await result.current.approve(user);
    });
    expect(result.current.approveError).toBe("Network failure");
    expect(mockToast.error).toHaveBeenCalledWith("Network failure");
  });
});

// ── useRejectHR ───────────────────────────────────────────────────────────────

describe("useRejectHR", () => {
  it("calls adminUserService.rejectHR with the user username", async () => {
    const { result } = renderHook(() => useRejectHR());
    const user = mockHRUser({ username: "hrtest1" });

    await act(async () => {
      await result.current.reject(user);
    });
    expect(mockAdminUserService.rejectHR).toHaveBeenCalledWith("hrtest1");
  });

  it("sets rejectingId during reject call and clears it after", async () => {
    let resolveReject!: () => void;
    mockAdminUserService.rejectHR.mockReturnValueOnce(
      new Promise<{ success: boolean; data: unknown }>((res) => {
        resolveReject = () => res({ success: true, data: {} });
      }),
    );

    const { result } = renderHook(() => useRejectHR());
    const user = mockHRUser({ userId: "u-2" });

    act(() => {
      result.current.reject(user);
    });
    await waitFor(() => expect(result.current.rejectingId).toBe("u-2"));

    await act(async () => {
      resolveReject();
    });
    await waitFor(() => expect(result.current.rejectingId).toBeNull());
  });

  it("calls onSuccess callback after successful rejection", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useRejectHR(onSuccess));
    const user = mockHRUser();

    await act(async () => {
      await result.current.reject(user);
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("sets rejectError and calls toast.error when rejectHR throws", async () => {
    mockAdminUserService.rejectHR.mockRejectedValueOnce(
      new Error("Reject failed"),
    );

    const { result } = renderHook(() => useRejectHR());
    const user = mockHRUser();

    await act(async () => {
      await result.current.reject(user);
    });
    expect(result.current.rejectError).toBe("Reject failed");
    expect(mockToast.error).toHaveBeenCalledWith("Reject failed");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hooks/useHrmApplications.ts — new hooks
// ─────────────────────────────────────────────────────────────────────────────

// ── useHRJobs ─────────────────────────────────────────────────────────────────

describe("useHRJobs", () => {
  it("starts with loading=true then resolves with jobs", async () => {
    const job = mockHRJobItem({ title: "Backend Dev" });
    server.use(
      http.get(`${API}/application/hr/jobs`, () =>
        apiSuccess({ items: [job], meta: mockPaginationMeta() }),
      ),
    );
    const { result } = renderHook(() => useHRJobs(1, 20));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].title).toBe("Backend Dev");
  });

  it("sets error when API returns failure", async () => {
    server.use(
      http.get(`${API}/application/hr/jobs`, () =>
        apiError("Server error", 500),
      ),
    );
    const { result } = renderHook(() => useHRJobs(1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load jobs/i);
    expect(result.current.jobs).toHaveLength(0);
  });

  it("returns empty array when API data is null", async () => {
    server.use(
      http.get(`${API}/application/hr/jobs`, () =>
        HttpResponse.json({ success: true, message: "OK", data: null }),
      ),
    );
    const { result } = renderHook(() => useHRJobs(1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toHaveLength(0);
  });

  it("refresh() re-triggers fetch and updates results", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/hr/jobs`, () => {
        callCount++;
        return apiSuccess({
          items: [mockHRJobItem()],
          meta: mockPaginationMeta(),
        });
      }),
    );
    const { result } = renderHook(() => useHRJobs(1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(callCount).toBe(1);

    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(callCount).toBe(2));
  });
});

// ── useHRCandidates ───────────────────────────────────────────────────────────

describe("useHRCandidates", () => {
  it("starts with loading=true then resolves with candidates", async () => {
    const candidate = mockHRCandidateItem({ fullName: "Jane Doe" });
    server.use(
      http.get(`${API}/application/hr/candidates`, () =>
        apiSuccess({ items: [candidate], meta: mockPaginationMeta() }),
      ),
    );
    const { result } = renderHook(() => useHRCandidates(1, 20));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.candidates).toHaveLength(1);
    expect(result.current.candidates[0].fullName).toBe("Jane Doe");
  });

  it("sets error when API returns failure", async () => {
    server.use(
      http.get(`${API}/application/hr/candidates`, () =>
        apiError("Server error", 500),
      ),
    );
    const { result } = renderHook(() => useHRCandidates(1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load candidates/i);
    expect(result.current.candidates).toHaveLength(0);
  });

  it("returns empty array when API data is null", async () => {
    server.use(
      http.get(`${API}/application/hr/candidates`, () =>
        HttpResponse.json({ success: true, message: "OK", data: null }),
      ),
    );
    const { result } = renderHook(() => useHRCandidates(1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.candidates).toHaveLength(0);
  });
});

// ── useCompanyJobs ────────────────────────────────────────────────────────────

describe("useCompanyJobs", () => {
  it("starts with loading=true then resolves with jobs", async () => {
    const job = mockHRJobItem({ title: "Frontend Dev", totalApplicants: 8 });
    server.use(
      http.get(`${API}/application/company/:companyNo/jobs`, () =>
        apiSuccess({ items: [job], meta: mockPaginationMeta() }),
      ),
    );
    const { result } = renderHook(() => useCompanyJobs("C001", 1, 20));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].title).toBe("Frontend Dev");
    expect(result.current.jobs[0].totalApplicants).toBe(8);
  });

  it("does not fetch when companyNo is empty", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/company/:companyNo/jobs`, () => {
        callCount++;
        return apiSuccess({
          items: [mockHRJobItem()],
          meta: mockPaginationMeta(),
        });
      }),
    );
    renderHook(() => useCompanyJobs("", 1, 20));
    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBe(0);
  });

  it("sets error when API returns failure", async () => {
    server.use(
      http.get(`${API}/application/company/:companyNo/jobs`, () =>
        apiError("Server error", 500),
      ),
    );
    const { result } = renderHook(() => useCompanyJobs("C001", 1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load jobs/i);
    expect(result.current.jobs).toHaveLength(0);
  });

  it("returns empty array when API data is null", async () => {
    server.use(
      http.get(`${API}/application/company/:companyNo/jobs`, () =>
        HttpResponse.json({ success: true, message: "OK", data: null }),
      ),
    );
    const { result } = renderHook(() => useCompanyJobs("C001", 1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toHaveLength(0);
  });
});

// ── useCompanyCandidates ──────────────────────────────────────────────────────

describe("useCompanyCandidates", () => {
  it("starts with loading=true then resolves with candidates", async () => {
    const candidate = mockHRCandidateItem({
      username: "alice",
      applicationCount: 3,
    });
    server.use(
      http.get(`${API}/application/company/:companyNo/candidates`, () =>
        apiSuccess({ items: [candidate], meta: mockPaginationMeta() }),
      ),
    );
    const { result } = renderHook(() => useCompanyCandidates("C001", 1, 20));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.candidates).toHaveLength(1);
    expect(result.current.candidates[0].username).toBe("alice");
    expect(result.current.candidates[0].applicationCount).toBe(3);
  });

  it("does not fetch when companyNo is empty", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/company/:companyNo/candidates`, () => {
        callCount++;
        return apiSuccess({
          items: [],
          meta: mockPaginationMeta({ totalElements: 0 }),
        });
      }),
    );
    renderHook(() => useCompanyCandidates("", 1, 20));
    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBe(0);
  });

  it("sets error when API returns failure", async () => {
    server.use(
      http.get(`${API}/application/company/:companyNo/candidates`, () =>
        apiError("Server error", 500),
      ),
    );
    const { result } = renderHook(() => useCompanyCandidates("C001", 1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/Failed to load candidates/i);
    expect(result.current.candidates).toHaveLength(0);
  });

  it("refresh() re-triggers fetch", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/company/:companyNo/candidates`, () => {
        callCount++;
        return apiSuccess({
          items: [mockHRCandidateItem()],
          meta: mockPaginationMeta(),
        });
      }),
    );
    const { result } = renderHook(() => useCompanyCandidates("C001", 1, 20));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(callCount).toBe(1);

    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(callCount).toBe(2));
  });
});
