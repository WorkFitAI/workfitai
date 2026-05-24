/**
 * Unit tests — useApplicationDetail hook
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http } from "msw";
import { server } from "../../mocks/server";
import {
  apiSuccess,
  apiError,
  mockApplicationDetail,
  mockStatusHistoryItem,
} from "../../mocks/handlers";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";

const API = "https://api.workfitai.uk";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useApplicationDetail", () => {
  it("skips fetch when applicationId is empty", async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/application/:id`, () => {
        callCount++;
        return apiSuccess(mockApplicationDetail());
      }),
    );
    const { result } = renderHook(() => useApplicationDetail(""));
    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.application).toBeNull();
  });

  it("starts with loading=true then false after resolve", async () => {
    server.use(
      http.get(`${API}/application/app-001`, () =>
        apiSuccess(mockApplicationDetail()),
      ),
      http.get(`${API}/application/app-001/history`, () => apiSuccess([])),
    );
    const { result } = renderHook(() => useApplicationDetail("app-001"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("fetches detail and history in parallel and sets state", async () => {
    const detail = mockApplicationDetail({
      id: "app-001",
      status: "INTERVIEW",
    });
    const history = [
      mockStatusHistoryItem({ newStatus: "APPLIED", previousStatus: null }),
      mockStatusHistoryItem({
        newStatus: "INTERVIEW",
        previousStatus: "APPLIED",
      }),
    ];
    server.use(
      http.get(`${API}/application/app-001`, () => apiSuccess(detail)),
      http.get(`${API}/application/app-001/history`, () => apiSuccess(history)),
    );
    const { result } = renderHook(() => useApplicationDetail("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.application?.status).toBe("INTERVIEW");
    expect(result.current.statusHistory).toHaveLength(2);
    expect(result.current.statusHistory[1].newStatus).toBe("INTERVIEW");
  });

  it("sets empty statusHistory when history returns empty array", async () => {
    server.use(
      http.get(`${API}/application/app-001`, () =>
        apiSuccess(mockApplicationDetail()),
      ),
      http.get(`${API}/application/app-001/history`, () => apiSuccess([])),
    );
    const { result } = renderHook(() => useApplicationDetail("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statusHistory).toHaveLength(0);
  });

  it("sets error state when detail fetch fails", async () => {
    server.use(
      http.get(`${API}/application/app-001`, () => apiError("Not found", 404)),
      http.get(`${API}/application/app-001/history`, () => apiSuccess([])),
    );
    const { result } = renderHook(() => useApplicationDetail("app-001"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/failed to load/i);
    expect(result.current.application).toBeNull();
  });

  it("re-fetches when applicationId changes", async () => {
    let lastPath = "";
    server.use(
      http.get(`${API}/application/:id`, ({ params }) => {
        lastPath = params.id as string;
        return apiSuccess(mockApplicationDetail({ id: params.id as string }));
      }),
      http.get(`${API}/application/:id/history`, () => apiSuccess([])),
    );
    const { result, rerender } = renderHook(
      ({ id }) => useApplicationDetail(id),
      {
        initialProps: { id: "app-001" },
      },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(lastPath).toBe("app-001");

    rerender({ id: "app-002" });
    await waitFor(() => expect(lastPath).toBe("app-002"));
  });
});
