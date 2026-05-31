import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { apiSuccess } from "../../mocks/handlers";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { CandidateProfile, AvatarData } from "@/types/user";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk";

function mockCandidateProfile(
  overrides: Partial<CandidateProfile> = {},
): CandidateProfile {
  return {
    userId: "u1",
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    userRole: "CANDIDATE",
    userStatus: "ACTIVE",
    ...overrides,
  };
}

function mockAvatarData(overrides: Partial<AvatarData> = {}): AvatarData {
  return {
    avatarUrl: "https://cdn.example.com/avatar.jpg",
    publicId: "public-id-123",
    uploadedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useUserProfile", () => {
  it("should initialize with loading=true, profile=null, error=null", () => {
    server.use(http.get(`${API}/user/profile/me`, () => new Promise(() => {})));

    const { result } = renderHook(() => useUserProfile());

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should fetch profile on mount", async () => {
    const mockProfile = mockCandidateProfile({
      userId: "u1",
      fullName: "John Doe",
    });

    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(mockProfile)),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile should have avatarUrl merged (null when avatar fetch fails)
    expect(result.current.profile?.userId).toBe("u1");
    expect(result.current.profile?.fullName).toBe("John Doe");
    expect(result.current.error).toBe(null);
  });

  it("should fetch profile and avatar in parallel", async () => {
    const mockProfile = mockCandidateProfile();
    const mockAvatar = mockAvatarData();

    let profileCalled = false;
    let avatarCalled = false;

    server.use(
      http.get(`${API}/user/profile/me`, async () => {
        profileCalled = true;
        return apiSuccess(mockProfile);
      }),
      http.get(`${API}/user/profile/avatar`, async () => {
        avatarCalled = true;
        return apiSuccess(mockAvatar);
      }),
    );

    renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(profileCalled && avatarCalled).toBe(true);
    });
  });

  it("should merge avatarUrl into profile when both succeed", async () => {
    const mockProfile = mockCandidateProfile({
      userId: "u1",
      fullName: "John Doe",
    });
    const mockAvatar = mockAvatarData({
      avatarUrl: "https://cdn.example.com/custom-avatar.jpg",
    });

    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(mockProfile)),
      http.get(`${API}/user/profile/avatar`, () => apiSuccess(mockAvatar)),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.avatarUrl).toBe(
      "https://cdn.example.com/custom-avatar.jpg",
    );
  });

  it("should set avatarUrl to null when avatar fetch fails", async () => {
    const mockProfile = mockCandidateProfile();

    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(mockProfile)),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.avatarUrl).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should handle fetch rejection gracefully", async () => {
    server.use(
      http.get(`${API}/user/profile/me`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    // Hook will still load since we're returning a valid response with error status
    // The hook treats any response as successful in Promise.allSettled
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should set profile to null when profile data is null", async () => {
    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(null as any)),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should handle network error", async () => {
    server.use(
      http.get(`${API}/user/profile/me`, () => {
        throw new Error("Network error");
      }),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load profile.");
    expect(result.current.profile).toBe(null);
  });

  it("should provide refresh function to refetch", async () => {
    const mockProfile = mockCandidateProfile();
    let callCount = 0;

    server.use(
      http.get(`${API}/user/profile/me`, () => {
        callCount++;
        return apiSuccess(mockProfile);
      }),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callCount).toBe(1);

    await result.current.refresh();

    await waitFor(() => {
      // Should refetch
      expect(callCount).toBe(2);
    });
  });

  it("should include avatarUrl when avatar endpoint returns data", async () => {
    const mockProfile = mockCandidateProfile({
      userId: "u1",
      email: "john@example.com",
    });
    const mockAvatar = mockAvatarData({
      avatarUrl: "https://cdn.example.com/john-avatar.jpg",
    });

    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(mockProfile)),
      http.get(`${API}/user/profile/avatar`, () => apiSuccess(mockAvatar)),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Profile should have merged avatarUrl
    expect(result.current.profile).toEqual(
      expect.objectContaining({
        userId: "u1",
        email: "john@example.com",
        avatarUrl: "https://cdn.example.com/john-avatar.jpg",
      }),
    );
  });

  it("should handle concurrent refresh calls", async () => {
    const mockProfile = mockCandidateProfile();
    let callCount = 0;

    server.use(
      http.get(`${API}/user/profile/me`, () => {
        callCount++;
        return apiSuccess(mockProfile);
      }),
      http.get(`${API}/user/profile/avatar`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Multiple refresh calls should work
    await Promise.all([
      result.current.refresh(),
      result.current.refresh(),
      result.current.refresh(),
    ]);

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).not.toBe(null);
  });

  it("should handle avatar null response", async () => {
    const mockProfile = mockCandidateProfile();

    server.use(
      http.get(`${API}/user/profile/me`, () => apiSuccess(mockProfile)),
      http.get(`${API}/user/profile/avatar`, () =>
        apiSuccess({ avatarUrl: null, publicId: "", uploadedAt: "" }),
      ),
    );

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.avatarUrl).toBe(null);
  });
});
