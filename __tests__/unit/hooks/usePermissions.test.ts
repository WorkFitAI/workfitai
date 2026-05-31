import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "../../mocks/server"
import { apiSuccess, mockPermission } from "../../mocks/handlers"
import { usePermissions } from "@/hooks/usePermissions"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("usePermissions", () => {
  it("starts loading and populates permissions on success", async () => {
    const permissions = [
      mockPermission({ name: "application:read", description: "Read applications" }),
      mockPermission({ name: "job:read", description: "Read jobs" }),
    ]
    server.use(http.get(`${API}/auth/permissions`, () => apiSuccess(permissions)))

    const { result } = renderHook(() => usePermissions())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.permissions).toEqual(permissions)
    expect(result.current.error).toBeNull()
  })

  it("sets error when fetch fails", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => usePermissions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Failed to load permissions.")
    expect(result.current.permissions).toEqual([])
  })

  it("returns empty array when API returns null data", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        HttpResponse.json({ success: true, data: null }),
      ),
    )

    const { result } = renderHook(() => usePermissions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.permissions).toEqual([])
  })

  it("refresh re-fetches permissions", async () => {
    let callCount = 0
    server.use(
      http.get(`${API}/auth/permissions`, () => {
        callCount++
        return apiSuccess([mockPermission()])
      }),
    )

    const { result } = renderHook(() => usePermissions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)

    await act(async () => {
      await result.current.refresh()
    })
    expect(callCount).toBe(2)
  })

  it("clears error on successful re-fetch after prior failure", async () => {
    let shouldFail = true
    server.use(
      http.get(`${API}/auth/permissions`, () => {
        if (shouldFail) {
          return HttpResponse.json({ success: false }, { status: 500 })
        }
        return apiSuccess([mockPermission()])
      }),
    )

    const { result } = renderHook(() => usePermissions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).not.toBeNull()

    shouldFail = false
    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.permissions).toHaveLength(1)
  })
})
