import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSessions } from "@/hooks/use-sessions";
import { userService } from "@/lib/user/user-service";

vi.mock("@/lib/user/user-service", () => ({
  userService: {
    getActiveSessions: vi.fn(),
  },
}));

const mockUserSvc = vi.mocked(userService);

const mockSession = {
  sessionId: "sess-001",
  deviceInfo: "Chrome on macOS",
  ipAddress: "127.0.0.1",
  createdAt: "2026-01-15T08:00:00Z",
  lastAccessedAt: "2026-01-15T10:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSessions", () => {
  it("fetches sessions on mount", async () => {
    mockUserSvc.getActiveSessions.mockResolvedValue({ data: [mockSession] } as never);

    const { result } = renderHook(() => useSessions());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toEqual([mockSession]);
    expect(result.current.error).toBeNull();
    expect(mockUserSvc.getActiveSessions).toHaveBeenCalledOnce();
  });

  it("initializes with loading=true", () => {
    mockUserSvc.getActiveSessions.mockReturnValue(new Promise(() => {}) as never);
    const { result } = renderHook(() => useSessions());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after fetch completes", async () => {
    mockUserSvc.getActiveSessions.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("stores returned sessions in state", async () => {
    const sessions = [mockSession, { ...mockSession, sessionId: "sess-002" }];
    mockUserSvc.getActiveSessions.mockResolvedValue({ data: sessions } as never);

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions).toHaveLength(2);
  });

  it("handles null data gracefully", async () => {
    mockUserSvc.getActiveSessions.mockResolvedValue({ data: null } as never);

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions).toEqual([]);
  });

  it("sets error message on rejection", async () => {
    mockUserSvc.getActiveSessions.mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.error).toBe("Failed to load sessions."));
    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("refresh re-fetches sessions", async () => {
    mockUserSvc.getActiveSessions.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.refresh());
    expect(mockUserSvc.getActiveSessions).toHaveBeenCalledTimes(2);
  });
});
