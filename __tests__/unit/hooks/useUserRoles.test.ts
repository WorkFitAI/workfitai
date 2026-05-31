import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "../../mocks/server"
import { apiSuccess } from "../../mocks/handlers"
import { useUserRoles } from "@/hooks/useUserRoles"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from "sonner"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

describe("useUserRoles", () => {
  it("skips fetch when username is empty", async () => {
    let fetched = false
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => {
        fetched = true
        return apiSuccess(["HR"])
      }),
    )

    const { result } = renderHook(() => useUserRoles(""))
    await new Promise((r) => setTimeout(r, 50))

    expect(fetched).toBe(false)
    expect(result.current.roles).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it("fetches roles on mount when username is provided", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () =>
        apiSuccess(["HR", "HR_CUSTOM"]),
      ),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.roles).toEqual(["HR", "HR_CUSTOM"])
    expect(result.current.error).toBeNull()
  })

  it("sets error when fetch fails", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Failed to load user roles.")
    expect(result.current.roles).toEqual([])
  })

  it("saveRoles grants only new roles via batch", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
    )

    let grantBody: unknown
    let revokeCalled = false
    server.use(
      http.post(`${API}/auth/users/:username/roles/batch`, async ({ request }) => {
        grantBody = await request.json()
        return apiSuccess({})
      }),
      http.delete(`${API}/auth/users/:username/roles/batch`, () => {
        revokeCalled = true
        return apiSuccess({})
      }),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveRoles(["HR"], ["HR", "HR_CUSTOM"])
    })

    expect(grantBody).toEqual({ roles: ["HR_CUSTOM"] })
    expect(revokeCalled).toBe(false)
    expect(toast.success).toHaveBeenCalledWith("User roles updated")
  })

  it("saveRoles revokes only removed roles via batch", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () =>
        apiSuccess(["HR", "HR_CUSTOM"]),
      ),
    )

    let revokeBody: unknown
    let grantCalled = false
    server.use(
      http.post(`${API}/auth/users/:username/roles/batch`, () => {
        grantCalled = true
        return apiSuccess({})
      }),
      http.delete(`${API}/auth/users/:username/roles/batch`, async ({ request }) => {
        revokeBody = await request.json()
        return apiSuccess({})
      }),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveRoles(["HR", "HR_CUSTOM"], ["HR"])
    })

    expect(revokeBody).toEqual({ roles: ["HR_CUSTOM"] })
    expect(grantCalled).toBe(false)
  })

  it("saveRoles calls both grant and revoke when diff has both changes", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
    )

    let grantCalled = false
    let revokeCalled = false
    server.use(
      http.post(`${API}/auth/users/:username/roles/batch`, () => {
        grantCalled = true
        return apiSuccess({})
      }),
      http.delete(`${API}/auth/users/:username/roles/batch`, () => {
        revokeCalled = true
        return apiSuccess({})
      }),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveRoles(["HR", "HR_OLD"], ["HR", "HR_NEW"])
    })

    expect(grantCalled).toBe(true)
    expect(revokeCalled).toBe(true)
  })

  it("saveRoles is a no-op when original and updated are identical", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
    )

    let grantCalled = false
    let revokeCalled = false
    server.use(
      http.post(`${API}/auth/users/:username/roles/batch`, () => {
        grantCalled = true
        return apiSuccess({})
      }),
      http.delete(`${API}/auth/users/:username/roles/batch`, () => {
        revokeCalled = true
        return apiSuccess({})
      }),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveRoles(["HR"], ["HR"])
    })

    expect(grantCalled).toBe(false)
    expect(revokeCalled).toBe(false)
    expect(toast.success).toHaveBeenCalledWith("User roles updated")
  })

  it("saveRoles shows error toast and still re-fetches on failure", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
      http.post(`${API}/auth/users/:username/roles/batch`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.saveRoles(["HR"], ["HR", "HR_CUSTOM"])
    })

    expect(toast.error).toHaveBeenCalledWith("Failed to update user roles")
  })

  it("saving state is true during save and false after", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
    )

    let resolveSave: () => void
    server.use(
      http.post(`${API}/auth/users/:username/roles/batch`, () =>
        new Promise<Response>((resolve) => {
          resolveSave = () => resolve(apiSuccess({}) as unknown as Response)
        }),
      ),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let savePromise: Promise<void>
    act(() => {
      savePromise = result.current.saveRoles(["HR"], ["HR", "HR_CUSTOM"])
    })

    await waitFor(() => expect(result.current.saving).toBe(true))
    act(() => resolveSave())
    await act(async () => { await savePromise })
    expect(result.current.saving).toBe(false)
  })

  it("refresh re-fetches roles", async () => {
    let callCount = 0
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => {
        callCount++
        return apiSuccess(["HR"])
      }),
    )

    const { result } = renderHook(() => useUserRoles("johndoe"))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)

    await act(async () => {
      await result.current.refresh()
    })
    expect(callCount).toBe(2)
  })
})
