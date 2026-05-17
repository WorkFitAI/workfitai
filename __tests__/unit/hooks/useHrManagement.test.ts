import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useCompanyHRManagement,
  useApproveHR,
  useRejectHR,
} from "@/hooks/useHrManagement";
import { applicationService } from "@/lib/application/application-service";
import { adminUserService } from "@/lib/admin/admin-user-service";

vi.mock("@/lib/application/application-service", () => ({
  applicationService: {
    getCompanyHRUsers: vi.fn(),
  },
}));

vi.mock("@/lib/admin/admin-user-service", () => ({
  adminUserService: {
    approveHR: vi.fn(),
    rejectHR: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

const mockApplicationSvc = vi.mocked(applicationService);
const mockAdminSvc = vi.mocked(adminUserService);
const mockToast = vi.mocked(toast);

const mockHRUser = {
  userId: "hr-001",
  username: "hr.user1",
  fullName: "HR User One",
  email: "hr1@company.com",
  phoneNumber: "+84900000001",
  userRole: "HR" as const,
  userStatus: "ACTIVE",
  companyId: "company-001",
  companyName: "Acme Corp",
  companyNo: "C001",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── useCompanyHRManagement ────────────────────────────────────────────────────

describe("useCompanyHRManagement", () => {
  it("fetches HR users on mount", async () => {
    mockApplicationSvc.getCompanyHRUsers.mockResolvedValue({ data: [mockHRUser] } as never);

    const { result } = renderHook(() => useCompanyHRManagement("C001"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hrUsers).toEqual([mockHRUser]);
    expect(result.current.error).toBeNull();
    expect(mockApplicationSvc.getCompanyHRUsers).toHaveBeenCalledWith("C001");
  });

  it("sets loading true then false", async () => {
    mockApplicationSvc.getCompanyHRUsers.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sets error when fetch fails", async () => {
    mockApplicationSvc.getCompanyHRUsers.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    await waitFor(() => expect(result.current.error).toBe("Failed to load HR users."));
    expect(result.current.hrUsers).toEqual([]);
  });

  it("does not fetch if companyNo is empty", async () => {
    const { result } = renderHook(() => useCompanyHRManagement(""));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApplicationSvc.getCompanyHRUsers).not.toHaveBeenCalled();
  });

  it("refresh re-fetches", async () => {
    mockApplicationSvc.getCompanyHRUsers.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useCompanyHRManagement("C001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.refresh());
    expect(mockApplicationSvc.getCompanyHRUsers).toHaveBeenCalledTimes(2);
  });
});

// ── useApproveHR ──────────────────────────────────────────────────────────────

describe("useApproveHR", () => {
  it("calls approveHR and shows success toast", async () => {
    mockAdminSvc.approveHR.mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useApproveHR(onSuccess));
    await act(() => result.current.approve(mockHRUser));

    expect(mockAdminSvc.approveHR).toHaveBeenCalledWith("hr.user1");
    expect(mockToast.success).toHaveBeenCalledWith("HR User One approved successfully");
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.approvingId).toBeNull();
    expect(result.current.approveError).toBeNull();
  });

  it("sets approvingId during operation", async () => {
    let resolve: () => void;
    mockAdminSvc.approveHR.mockReturnValue(new Promise<void>((r) => { resolve = r; }) as never);

    const { result } = renderHook(() => useApproveHR());
    act(() => { result.current.approve(mockHRUser); });

    await waitFor(() => expect(result.current.approvingId).toBe("hr-001"));
    resolve!();
    await waitFor(() => expect(result.current.approvingId).toBeNull());
  });

  it("shows error toast and sets approveError on failure", async () => {
    mockAdminSvc.approveHR.mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useApproveHR());
    await act(() => result.current.approve(mockHRUser));

    expect(mockToast.error).toHaveBeenCalledWith("Unauthorized");
    expect(result.current.approveError).toBe("Unauthorized");
  });

  it("clearError resets approveError", async () => {
    mockAdminSvc.approveHR.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useApproveHR());
    await act(() => result.current.approve(mockHRUser));
    expect(result.current.approveError).not.toBeNull();

    act(() => result.current.clearError());
    expect(result.current.approveError).toBeNull();
  });
});

// ── useRejectHR ───────────────────────────────────────────────────────────────

describe("useRejectHR", () => {
  it("calls rejectHR and shows success toast", async () => {
    mockAdminSvc.rejectHR.mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useRejectHR(onSuccess));
    await act(() => result.current.reject(mockHRUser));

    expect(mockAdminSvc.rejectHR).toHaveBeenCalledWith("hr.user1");
    expect(mockToast.success).toHaveBeenCalledWith("HR User One has been rejected");
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.rejectingId).toBeNull();
    expect(result.current.rejectError).toBeNull();
  });

  it("shows error toast and sets rejectError on failure", async () => {
    mockAdminSvc.rejectHR.mockRejectedValue(new Error("Forbidden"));

    const { result } = renderHook(() => useRejectHR());
    await act(() => result.current.reject(mockHRUser));

    expect(mockToast.error).toHaveBeenCalledWith("Forbidden");
    expect(result.current.rejectError).toBe("Forbidden");
  });

  it("clearError resets rejectError", async () => {
    mockAdminSvc.rejectHR.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useRejectHR());
    await act(() => result.current.reject(mockHRUser));

    act(() => result.current.clearError());
    expect(result.current.rejectError).toBeNull();
  });
});
