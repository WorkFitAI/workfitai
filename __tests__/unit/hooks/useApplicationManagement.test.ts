import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useStatusHistory,
  useApplicationNotes,
  useStatusUpdate,
  useAssignApplication,
} from "@/hooks/useApplicationManagement";
import { applicationService } from "@/lib/application/application-service";
import { ApiError } from "@/lib/api-client";

vi.mock("@/lib/application/application-service", () => ({
  applicationService: {
    getStatusHistory: vi.fn(),
    getApplicationNotes: vi.fn(),
    addApplicationNote: vi.fn(),
    updateApplicationNote: vi.fn(),
    deleteApplicationNote: vi.fn(),
    updateApplicationStatus: vi.fn(),
    assignApplication: vi.fn(),
  },
}));

const mockService = vi.mocked(applicationService);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── useStatusHistory ──────────────────────────────────────────────────────────

describe("useStatusHistory", () => {
  it("fetches history on mount", async () => {
    const history = [{ previousStatus: null, newStatus: "APPLIED", changedBy: "system", changedAt: "2026-01-01T00:00:00Z" }];
    mockService.getStatusHistory.mockResolvedValue({ data: history } as never);

    const { result } = renderHook(() => useStatusHistory("app-001"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.history).toEqual(history);
    expect(result.current.error).toBeNull();
    expect(mockService.getStatusHistory).toHaveBeenCalledWith("app-001");
  });

  it("sets loading true then false", async () => {
    mockService.getStatusHistory.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useStatusHistory("app-001"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sets error on failure", async () => {
    mockService.getStatusHistory.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useStatusHistory("app-001"));
    await waitFor(() => expect(result.current.error).toBe("Failed to load status history."));
    expect(result.current.history).toEqual([]);
  });

  it("does not fetch if applicationId is empty", async () => {
    const { result } = renderHook(() => useStatusHistory(""));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockService.getStatusHistory).not.toHaveBeenCalled();
  });

  it("refresh re-fetches", async () => {
    mockService.getStatusHistory.mockResolvedValue({ data: [] } as never);
    const { result } = renderHook(() => useStatusHistory("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.refresh());
    expect(mockService.getStatusHistory).toHaveBeenCalledTimes(2);
  });
});

// ── useApplicationNotes ───────────────────────────────────────────────────────

describe("useApplicationNotes", () => {
  const mockNote = { id: "note-1", author: "hr1", content: "Good candidate", candidateVisible: false, createdAt: "2026-01-01T00:00:00Z", updatedAt: null };

  it("fetches notes on mount", async () => {
    mockService.getApplicationNotes.mockResolvedValue({ data: [mockNote] } as never);

    const { result } = renderHook(() => useApplicationNotes("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notes).toEqual([mockNote]);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    mockService.getApplicationNotes.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useApplicationNotes("app-001"));
    await waitFor(() => expect(result.current.error).toBe("Failed to load notes."));
  });

  it("addNote calls service then refreshes", async () => {
    mockService.getApplicationNotes
      .mockResolvedValueOnce({ data: [] } as never)
      .mockResolvedValueOnce({ data: [mockNote] } as never);
    mockService.addApplicationNote.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useApplicationNotes("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.addNote("Good candidate", false));

    expect(mockService.addApplicationNote).toHaveBeenCalledWith("app-001", "Good candidate", false);
    expect(result.current.notes).toEqual([mockNote]);
  });

  it("editNote calls service then refreshes", async () => {
    mockService.getApplicationNotes.mockResolvedValue({ data: [mockNote] } as never);
    mockService.updateApplicationNote.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useApplicationNotes("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.editNote("note-1", "Updated", true));

    expect(mockService.updateApplicationNote).toHaveBeenCalledWith("app-001", "note-1", "Updated", true);
  });

  it("deleteNote removes item from local state", async () => {
    mockService.getApplicationNotes.mockResolvedValue({ data: [mockNote] } as never);
    mockService.deleteApplicationNote.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useApplicationNotes("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.deleteNote("note-1"));

    expect(result.current.notes).toEqual([]);
    expect(mockService.deleteApplicationNote).toHaveBeenCalledWith("app-001", "note-1");
  });
});

// ── useStatusUpdate ───────────────────────────────────────────────────────────

describe("useStatusUpdate", () => {
  it("calls updateApplicationStatus and fires onSuccess", async () => {
    mockService.updateApplicationStatus.mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useStatusUpdate("app-001", onSuccess));

    await act(() => result.current.updateStatus("REVIEWING"));

    expect(mockService.updateApplicationStatus).toHaveBeenCalledWith("app-001", "REVIEWING");
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.updating).toBe(false);
    expect(result.current.statusError).toBeNull();
  });

  it("sets statusError with ApiError message on failure", async () => {
    const apiErr = new ApiError("Invalid status transition", 422);
    mockService.updateApplicationStatus.mockRejectedValue(apiErr);

    const { result } = renderHook(() => useStatusUpdate("app-001"));
    await act(() => result.current.updateStatus("REJECTED"));

    expect(result.current.statusError).toBe("Invalid status transition");
    expect(result.current.updating).toBe(false);
  });

  it("sets generic statusError for non-ApiError", async () => {
    mockService.updateApplicationStatus.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useStatusUpdate("app-001"));
    await act(() => result.current.updateStatus("REJECTED"));

    expect(result.current.statusError).toBe("Failed to update status.");
  });

  it("clearStatusError resets the error", async () => {
    mockService.updateApplicationStatus.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useStatusUpdate("app-001"));
    await act(() => result.current.updateStatus("REJECTED"));
    expect(result.current.statusError).not.toBeNull();

    act(() => result.current.clearStatusError());
    expect(result.current.statusError).toBeNull();
  });
});

// ── useAssignApplication ──────────────────────────────────────────────────────

describe("useAssignApplication", () => {
  it("calls assignApplication and fires onSuccess", async () => {
    mockService.assignApplication.mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAssignApplication(onSuccess));
    await act(() => result.current.assign("app-001", "hr.user1"));

    expect(mockService.assignApplication).toHaveBeenCalledWith("app-001", "hr.user1");
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.assigning).toBe(false);
    expect(result.current.assignError).toBeNull();
  });

  it("sets assignError on failure", async () => {
    mockService.assignApplication.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useAssignApplication());
    await act(() => result.current.assign("app-001", "hr.user1"));

    expect(result.current.assignError).toBe("Failed to assign application.");
    expect(result.current.assigning).toBe(false);
  });

  it("clearAssignError resets the error", async () => {
    mockService.assignApplication.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useAssignApplication());
    await act(() => result.current.assign("app-001", "hr.user1"));
    expect(result.current.assignError).not.toBeNull();

    act(() => result.current.clearAssignError());
    expect(result.current.assignError).toBeNull();
  });
});
