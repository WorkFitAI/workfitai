/**
 * Unit tests — useApplications hook
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { apiSuccess, apiError, mockApplication, mockPaginationMeta } from '../../mocks/handlers'
import { useApplications } from '@/hooks/useApplications'

const API = 'http://localhost:9085'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useApplications', () => {
  it('converts 1-indexed page to 0-indexed for API call', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url
        return apiSuccess({ items: [], meta: mockPaginationMeta() })
      })
    )
    renderHook(() => useApplications(3, 10))
    await waitFor(() => expect(capturedUrl).toContain('page=2'))
  })

  it('starts with loading=true then false after resolve', async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({ items: [mockApplication()], meta: mockPaginationMeta() })
      )
    )
    const { result } = renderHook(() => useApplications(1, 10))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('populates applications and totals on success', async () => {
    const item = mockApplication({ status: 'REVIEWING' })
    const meta = mockPaginationMeta({ totalElements: 5, totalPages: 2 })
    server.use(
      http.get(`${API}/application/my`, () => apiSuccess({ items: [item], meta }))
    )
    const { result } = renderHook(() => useApplications(1, 10))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.applications[0].status).toBe('REVIEWING')
    expect(result.current.total).toBe(5)
    expect(result.current.totalPages).toBe(2)
  })

  it('sets error message on API failure', async () => {
    server.use(
      http.get(`${API}/application/my`, () => apiError('Internal error', 500))
    )
    const { result } = renderHook(() => useApplications(1, 10))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/failed to load/i)
    expect(result.current.applications).toHaveLength(0)
  })

  it('returns empty list and defaults when items is empty', async () => {
    server.use(
      http.get(`${API}/application/my`, () =>
        apiSuccess({ items: [], meta: mockPaginationMeta({ totalElements: 0 }) })
      )
    )
    const { result } = renderHook(() => useApplications(1, 10))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.applications).toHaveLength(0)
    expect(result.current.total).toBe(0)
  })

  it('passes statusFilter as query param', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/application/my`, ({ request }) => {
        capturedUrl = request.url
        return apiSuccess({ items: [], meta: mockPaginationMeta() })
      })
    )
    renderHook(() => useApplications(1, 10, 'OFFER'))
    await waitFor(() => expect(capturedUrl).toContain('status=OFFER'))
  })

  it('refresh() re-triggers fetch', async () => {
    let callCount = 0
    server.use(
      http.get(`${API}/application/my`, () => {
        callCount++
        return apiSuccess({ items: [], meta: mockPaginationMeta() })
      })
    )
    const { result } = renderHook(() => useApplications(1, 10))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)
    result.current.refresh()
    await waitFor(() => expect(callCount).toBe(2))
  })
})
