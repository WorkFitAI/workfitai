import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "../../mocks/server"
import { apiSuccess, mockRole } from "../../mocks/handlers"
import { useRoles, useRole, useCloneRole } from "@/hooks/useRoles"

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

// ── useRoles ──────────────────────────────────────────────────────────────────

describe("useRoles", () => {
  it("starts loading and populates roles on success", async () => {
    const roles = [mockRole({ name: "HR" }), mockRole({ name: "HR_CUSTOM" })]
    server.use(http.get(`${API}/auth/roles`, () => apiSuccess(roles)))

    const { result } = renderHook(() => useRoles())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.roles).toEqual(roles)
    expect(result.current.error).toBeNull()
  })

  it("sets error when fetch fails", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useRoles())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Failed to load roles.")
    expect(result.current.roles).toEqual([])
  })

  it("deleteRole calls DELETE, shows success toast, and re-fetches", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () => apiSuccess([mockRole({ name: "HR_CUSTOM" })])),
      http.delete(`${API}/auth/roles/:roleName`, () =>
        HttpResponse.json({ success: true, message: "Deleted" }),
      ),
    )

    const { result } = renderHook(() => useRoles())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteRole("HR_CUSTOM")
    })

    expect(toast.success).toHaveBeenCalledWith('Role "HR_CUSTOM" deleted')
    expect(result.current.deletingName).toBeNull()
  })

  it("deleteRole shows error toast and clears deletingName on failure", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () => apiSuccess([mockRole()])),
      http.delete(`${API}/auth/roles/:roleName`, () =>
        HttpResponse.json({ success: false }, { status: 400 }),
      ),
    )

    const { result } = renderHook(() => useRoles())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteRole("HR_CUSTOM")
    })

    expect(toast.error).toHaveBeenCalledWith('Failed to delete role "HR_CUSTOM"')
    expect(result.current.deletingName).toBeNull()
  })

  it("refresh re-fetches roles", async () => {
    let callCount = 0
    server.use(
      http.get(`${API}/auth/roles`, () => {
        callCount++
        return apiSuccess([mockRole()])
      }),
    )

    const { result } = renderHook(() => useRoles())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)

    await act(async () => {
      await result.current.refresh()
    })
    expect(callCount).toBe(2)
  })
})

// ── useRole ───────────────────────────────────────────────────────────────────

describe("useRole", () => {
  it("fetches /auth/roles/:name on mount", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))

    const { result } = renderHook(() => useRole("HR_CUSTOM"))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.role).toEqual(role)
    expect(result.current.error).toBeNull()
  })

  it("skips fetch when name is empty", async () => {
    let fetched = false
    server.use(
      http.get(`${API}/auth/roles/:name`, () => {
        fetched = true
        return apiSuccess(mockRole())
      }),
    )

    const { result } = renderHook(() => useRole(""))
    // give async a tick to potentially fire
    await new Promise((r) => setTimeout(r, 50))
    expect(fetched).toBe(false)
    expect(result.current.role).toBeNull()
  })

  it("sets error on fetch failure", async () => {
    server.use(
      http.get(`${API}/auth/roles/:name`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Failed to load role.")
    expect(result.current.role).toBeNull()
  })

  it("savePermissions calls addPermissionsBatch only for new perms", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))

    let batchAddCalled = false
    let batchRemoveCalled = false
    server.use(
      http.post(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        batchAddCalled = true
        return apiSuccess(mockRole())
      }),
      http.delete(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        batchRemoveCalled = true
        return apiSuccess(mockRole())
      }),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let returnVal: boolean | undefined
    await act(async () => {
      returnVal = await result.current.savePermissions(
        ["application:read"],
        ["application:read", "job:read"],
      )
    })

    expect(batchAddCalled).toBe(true)
    expect(batchRemoveCalled).toBe(false)
    expect(toast.success).toHaveBeenCalledWith("Permissions updated")
    expect(returnVal).toBe(true)
  })

  it("savePermissions calls removePermissionsBatch only for removed perms", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: ["application:read", "job:read"] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))

    let batchAddCalled = false
    let batchRemoveCalled = false
    server.use(
      http.post(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        batchAddCalled = true
        return apiSuccess(mockRole())
      }),
      http.delete(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        batchRemoveCalled = true
        return apiSuccess(mockRole())
      }),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.savePermissions(["application:read", "job:read"], ["application:read"])
    })

    expect(batchAddCalled).toBe(false)
    expect(batchRemoveCalled).toBe(true)
  })

  it("savePermissions calls both add and remove when diff has both", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))

    let addCalled = false
    let removeCalled = false
    server.use(
      http.post(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        addCalled = true
        return apiSuccess(mockRole())
      }),
      http.delete(`${API}/auth/roles/:roleName/permissions/batch`, () => {
        removeCalled = true
        return apiSuccess(mockRole())
      }),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.savePermissions(["application:read"], ["job:read"])
    })

    expect(addCalled).toBe(true)
    expect(removeCalled).toBe(true)
  })

  it("savePermissions shows error toast, still re-fetches, returns false on failure", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))
    server.use(
      http.post(`${API}/auth/roles/:roleName/permissions/batch`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let returnVal: boolean | undefined
    await act(async () => {
      returnVal = await result.current.savePermissions(["application:read"], ["job:read"])
    })

    expect(toast.error).toHaveBeenCalledWith("Failed to save permissions")
    expect(returnVal).toBe(false)
  })

  it("saving state is true during save and false after", async () => {
    const role = mockRole({ name: "HR_CUSTOM", permissions: [] })
    server.use(http.get(`${API}/auth/roles/:name`, () => apiSuccess(role)))

    let resolveSave: () => void
    server.use(
      http.post(`${API}/auth/roles/:roleName/permissions/batch`, () =>
        new Promise<Response>((resolve) => {
          resolveSave = () => resolve(apiSuccess(mockRole()) as unknown as Response)
        }),
      ),
    )

    const { result } = renderHook(() => useRole("HR_CUSTOM"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let savePromise: Promise<boolean>
    act(() => {
      savePromise = result.current.savePermissions([], ["job:read"])
    })

    await waitFor(() => expect(result.current.saving).toBe(true))
    act(() => resolveSave())
    await act(async () => { await savePromise })
    expect(result.current.saving).toBe(false)
  })
})

// ── useCloneRole ──────────────────────────────────────────────────────────────

describe("useCloneRole", () => {
  it("calls POST /auth/roles/:sourceName/clone, shows toast, calls onSuccess, returns true", async () => {
    server.use(
      http.post(`${API}/auth/roles/:sourceName/clone`, () =>
        apiSuccess(mockRole({ name: "HR_CUSTOM_CLONE" })),
      ),
    )

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCloneRole(onSuccess))

    let returnVal: boolean | undefined
    await act(async () => {
      returnVal = await result.current.cloneRole("HR", "HR_CUSTOM_CLONE", "Clone of HR")
    })

    expect(toast.success).toHaveBeenCalledWith('Role "HR_CUSTOM_CLONE" created')
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(returnVal).toBe(true)
  })

  it("shows error toast and returns false on failure", async () => {
    server.use(
      http.post(`${API}/auth/roles/:sourceName/clone`, () =>
        HttpResponse.json({ success: false }, { status: 409 }),
      ),
    )

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCloneRole(onSuccess))

    let returnVal: boolean | undefined
    await act(async () => {
      returnVal = await result.current.cloneRole("HR", "HR_CUSTOM", "Clone")
    })

    expect(toast.error).toHaveBeenCalledWith("Failed to clone role")
    expect(onSuccess).not.toHaveBeenCalled()
    expect(returnVal).toBe(false)
  })

  it("cloning state is true during request and false after", async () => {
    let resolveSave: () => void
    server.use(
      http.post(`${API}/auth/roles/:sourceName/clone`, () =>
        new Promise<Response>((resolve) => {
          resolveSave = () => resolve(apiSuccess(mockRole()) as unknown as Response)
        }),
      ),
    )

    const { result } = renderHook(() => useCloneRole(vi.fn()))

    let clonePromise: Promise<boolean>
    act(() => {
      clonePromise = result.current.cloneRole("HR", "HR_CUSTOM", "Clone")
    })

    await waitFor(() => expect(result.current.cloning).toBe(true))
    act(() => resolveSave())
    await act(async () => { await clonePromise })
    expect(result.current.cloning).toBe(false)
  })
})
