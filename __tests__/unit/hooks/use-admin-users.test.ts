import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { apiSuccess } from "../../mocks/handlers";
import {
  useAdminUsers,
  useApprovalQueue,
  useAdminUser,
} from "@/hooks/useAdminUsers";
import type {
  EsSearchResult,
  EsUserHit,
  AdminUserSummary,
} from "@/types/admin-user";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk";

function mockEsResult(overrides: Partial<EsSearchResult> = {}): EsSearchResult {
  return {
    hits: [],
    totalHits: 0,
    from: 0,
    size: 10,
    roleAggregations: {},
    statusAggregations: {},
    ...overrides,
  };
}

function mockEsUserHit(overrides: Partial<EsUserHit> = {}): EsUserHit {
  return {
    userId: "user-1",
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    phoneNumber: null,
    avatarUrl: null,
    role: "CANDIDATE",
    status: "ACTIVE",
    blocked: false,
    deleted: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: null,
    companyNo: null,
    companyName: null,
    score: "1.0",
    highlights: {},
    ...overrides,
  };
}

function mockAdminUserSummary(
  overrides: Partial<AdminUserSummary> = {},
): AdminUserSummary {
  return {
    userId: "user-1",
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    phoneNumber: null,
    userRole: "CANDIDATE",
    userStatus: "ACTIVE",
    companyId: null,
    companyName: null,
    companyNo: null,
    department: null,
    address: null,
    createdBy: null,
    createdDate: "2026-01-01T00:00:00Z",
    lastModifiedBy: null,
    lastModifiedDate: null,
    deleted: false,
    ...overrides,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useAdminUsers", () => {
  it("should initialize with loading=true, empty users, totalHits=0", () => {
    server.use(
      http.post(`${API}/user/admins/users/search`, () => new Promise(() => {})),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.totalHits).toBe(0);
    expect(result.current.error).toBe(null);
  });

  it("should fetch users and populate state on success", async () => {
    const mockUsers = [
      mockEsUserHit({ userId: "user-1", fullName: "Alice" }),
      mockEsUserHit({ userId: "user-2", fullName: "Bob" }),
    ];
    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        apiSuccess(mockEsResult({ hits: mockUsers, totalHits: 2 })),
      ),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveLength(2);
    expect(result.current.totalHits).toBe(2);
    expect(result.current.error).toBe(null);
  });

  it("should build correct ES search body with pagination", async () => {
    let capturedBody: any = null;
    server.use(
      http.post(`${API}/user/admins/users/search`, async ({ request }) => {
        capturedBody = await request.json();
        return apiSuccess(mockEsResult());
      }),
    );

    renderHook(() => useAdminUsers({ keyword: "john", page: 2, pageSize: 5 }));

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    // Page 2 with pageSize 5 → from = (2-1)*5 = 5
    expect(capturedBody.query).toBe("john");
    expect(capturedBody.from).toBe(5);
    expect(capturedBody.size).toBe(5);
    expect(capturedBody.blocked).toBe("false");
    expect(capturedBody.includeDeleted).toBe("false");
    expect(capturedBody.sortField).toBe("createdAt");
    expect(capturedBody.sortOrder).toBe("desc");
  });

  it("should include role filter in request body", async () => {
    let capturedBody: any = null;
    server.use(
      http.post(`${API}/user/admins/users/search`, async ({ request }) => {
        capturedBody = await request.json();
        return apiSuccess(mockEsResult());
      }),
    );

    renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10, role: "HR" }),
    );

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    expect(capturedBody.role).toBe("HR");
  });

  it("should calculate totalPages correctly", async () => {
    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        apiSuccess(mockEsResult({ totalHits: 25 })),
      ),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 25 / 10 = 2.5 → ceil = 3
    expect(result.current.totalPages).toBe(3);
  });

  it("should set error on fetch failure", async () => {
    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Failed to load users. Please try again.",
    );
  });

  it("should include roleAggregations and statusAggregations", async () => {
    const mockData = mockEsResult({
      roleAggregations: { CANDIDATE: 5, HR: 3 },
      statusAggregations: { ACTIVE: 7, BLOCKED: 1 },
    });
    server.use(
      http.post(`${API}/user/admins/users/search`, () => apiSuccess(mockData)),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roleAggregations).toEqual({ CANDIDATE: 5, HR: 3 });
    expect(result.current.statusAggregations).toEqual({
      ACTIVE: 7,
      BLOCKED: 1,
    });
  });

  it("should provide refresh function", async () => {
    let callCount = 0;
    server.use(
      http.post(`${API}/user/admins/users/search`, () => {
        callCount++;
        return apiSuccess(mockEsResult());
      }),
    );

    const { result } = renderHook(() =>
      useAdminUsers({ keyword: "", page: 1, pageSize: 10 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callCount).toBe(1);

    await result.current.refresh();

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });
});

describe("useApprovalQueue", () => {
  it("should fetch with status=WAIT_APPROVED", async () => {
    let capturedBody: any = null;
    server.use(
      http.post(`${API}/user/admins/users/search`, async ({ request }) => {
        capturedBody = await request.json();
        return apiSuccess(mockEsResult());
      }),
    );

    renderHook(() => useApprovalQueue());

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    expect(capturedBody.status).toBe("WAIT_APPROVED");
    expect(capturedBody.blocked).toBe("false");
    expect(capturedBody.includeDeleted).toBe("false");
    expect(capturedBody.sortOrder).toBe("asc");
  });

  it("should initialize with empty queue", () => {
    server.use(
      http.post(`${API}/user/admins/users/search`, () => new Promise(() => {})),
    );

    const { result } = renderHook(() => useApprovalQueue());

    expect(result.current.queue).toEqual([]);
    expect(result.current.totalHits).toBe(0);
    expect(result.current.loading).toBe(true);
  });

  it("should populate queue on success", async () => {
    const mockUsers = [
      mockEsUserHit({ userId: "user-1", role: "HR" }),
      mockEsUserHit({ userId: "user-2", role: "HR_MANAGER" }),
    ];
    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        apiSuccess(mockEsResult({ hits: mockUsers, totalHits: 2 })),
      ),
    );

    const { result } = renderHook(() => useApprovalQueue());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.queue).toHaveLength(2);
    expect(result.current.totalHits).toBe(2);
  });

  it("should approve manager and refresh", async () => {
    const queueUser = mockEsUserHit({
      userId: "user-1",
      username: "hruser",
      role: "HR_MANAGER",
    });
    let approveCalled = false;

    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        apiSuccess(mockEsResult({ hits: [queueUser], totalHits: 1 })),
      ),
      http.post(`${API}/user/hr/username/hruser/approve-manager`, () => {
        approveCalled = true;
        return apiSuccess({});
      }),
    );

    const { result } = renderHook(() => useApprovalQueue());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.queue).toHaveLength(1);

    await result.current.approve(queueUser);

    await waitFor(() => {
      expect(approveCalled).toBe(true);
    });
  });

  it("should clear approvingId after approval completes", async () => {
    const queueUser = mockEsUserHit({
      userId: "user-1",
      username: "hruser",
    });

    server.use(
      http.post(`${API}/user/admins/users/search`, () =>
        apiSuccess(mockEsResult({ hits: [queueUser] })),
      ),
      http.post(`${API}/user/hr/username/hruser/approve-manager`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return apiSuccess({});
      }),
    );

    const { result } = renderHook(() => useApprovalQueue());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.approve(queueUser);

    // approvingId should be cleared after approval
    await waitFor(
      () => {
        expect(result.current.approvingId).toBe(null);
      },
      { timeout: 2000 },
    );
  });
});

describe("useAdminUser", () => {
  it("should initialize with null user and loading=true", () => {
    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => new Promise(() => {})),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should fetch user on mount", async () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      fullName: "Test User",
    });
    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => apiSuccess(mockUser)),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
  });

  it("should set error on fetch failure", async () => {
    server.use(
      http.get(`${API}/user/admins/users/user-1`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load user.");
    expect(result.current.user).toBe(null);
  });

  it("should fetch full profile on demand", async () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      userRole: "CANDIDATE",
    });
    const mockProfile = {
      ...mockUser,
      skills: ["JavaScript", "React"],
      totalExperience: 5,
    };

    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => apiSuccess(mockUser)),
      http.get(`${API}/user/admins/users/user-1/full-profile`, () =>
        apiSuccess(mockProfile),
      ),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    await result.current.fetchFullProfile();

    await waitFor(() => {
      expect(result.current.fullProfile).not.toBe(null);
    });

    expect(result.current.fullProfile?.skills).toEqual(["JavaScript", "React"]);
  });

  it("should toggle block for ACTIVE user", async () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      userStatus: "ACTIVE",
    });
    let blockCalled = false;
    let blockValue = false;

    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => apiSuccess(mockUser)),
      http.put(`${API}/user/admins/users/user-1/block`, async ({ request }) => {
        blockCalled = true;
        blockValue =
          new URL(request.url).searchParams.get("blocked") === "true";
        return apiSuccess({});
      }),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    await result.current.toggleBlock();

    await waitFor(() => {
      expect(blockCalled).toBe(true);
    });

    // ACTIVE → should block (set to true)
    expect(blockValue).toBe(true);
  });

  it("should toggle unblock for BLOCKED user", async () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      userStatus: "BLOCKED",
    });
    let blockValue = false;

    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => apiSuccess(mockUser)),
      http.put(`${API}/user/admins/users/user-1/block`, async ({ request }) => {
        blockValue =
          new URL(request.url).searchParams.get("blocked") === "true";
        return apiSuccess({});
      }),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    await result.current.toggleBlock();

    await waitFor(() => {
      expect(blockValue).toBe(false);
    });
  });

  it("should clear blocking state after toggle completes", async () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      userStatus: "ACTIVE",
    });

    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => apiSuccess(mockUser)),
      http.put(`${API}/user/admins/users/user-1/block`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return apiSuccess({});
      }),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.user).not.toBe(null);
    });

    await result.current.toggleBlock();

    // Should clear blocking state after toggle completes
    await waitFor(
      () => {
        expect(result.current.blocking).toBe(false);
      },
      { timeout: 2000 },
    );
  });

  it("should provide refresh function", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/user/admins/users/user-1`, () => {
        callCount++;
        return apiSuccess(mockAdminUserSummary());
      }),
    );

    const { result } = renderHook(() => useAdminUser("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callCount).toBe(1);

    await result.current.refresh();

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });
});
