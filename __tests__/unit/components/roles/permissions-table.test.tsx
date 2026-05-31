import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../../../mocks/server"
import { apiSuccess, mockPermission } from "../../../mocks/handlers"
import { PermissionsTable } from "@/components/roles/permissions-table"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("PermissionsTable", () => {
  it("shows loading spinner while fetching", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, async () => {
        await new Promise((r) => setTimeout(r, 20))
        return apiSuccess([mockPermission()])
      }),
    )
    render(<PermissionsTable />)
    expect(screen.getByText("Loading permissions…")).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText("Loading permissions…")).not.toBeInTheDocument(),
    )
  })

  it("renders permission rows after load", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "Read apps" }),
          mockPermission({ name: "job:read", description: "Read jobs" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())
    expect(screen.getByText("job:read")).toBeInTheDocument()
  })

  it("renders namespace separator rows", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "Read" }),
          mockPermission({ name: "job:read", description: "Read" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    // Namespace badge labels appear as separator rows
    const nsBadges = screen.getAllByText("application")
    expect(nsBadges.length).toBeGreaterThanOrEqual(1)
    const jobBadges = screen.getAllByText("job")
    expect(jobBadges.length).toBeGreaterThanOrEqual(1)
  })

  it("shows namespace filter chips", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "" }),
          mockPermission({ name: "hr:manage", description: "" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    // "All" chip plus one per namespace
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument()
  })

  it("clicking a namespace chip filters to that namespace", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "" }),
          mockPermission({ name: "job:read", description: "" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    const user = userEvent.setup()
    // Find the chip buttons in the filter toolbar (not the namespace separator rows)
    const chipButtons = screen.getAllByRole("button")
    const jobChip = chipButtons.find((b) => b.textContent === "job")
    expect(jobChip).toBeDefined()
    await user.click(jobChip!)

    expect(screen.queryByText("application:read")).not.toBeInTheDocument()
    expect(screen.getByText("job:read")).toBeInTheDocument()
  })

  it("clicking All chip clears namespace filter", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "" }),
          mockPermission({ name: "job:read", description: "" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    const user = userEvent.setup()
    // First filter to job
    const chipButtons = screen.getAllByRole("button")
    const jobChip = chipButtons.find((b) => b.textContent === "job")
    await user.click(jobChip!)
    expect(screen.queryByText("application:read")).not.toBeInTheDocument()

    // Now click All to clear
    await user.click(screen.getByRole("button", { name: "All" }))
    expect(screen.getByText("application:read")).toBeInTheDocument()
  })

  it("search input filters permissions by name", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "" }),
          mockPermission({ name: "job:write", description: "" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("Search permissions…"), "job")

    expect(screen.queryByText("application:read")).not.toBeInTheDocument()
    expect(screen.getByText("job:write")).toBeInTheDocument()
  })

  it("shows 'No permissions found' when search yields no results", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([mockPermission({ name: "application:read", description: "" })]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() => expect(screen.getByText("application:read")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("Search permissions…"), "nonexistent")

    expect(screen.getByText("No permissions found")).toBeInTheDocument()
  })

  it("displays correct count text", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        apiSuccess([
          mockPermission({ name: "application:read", description: "" }),
          mockPermission({ name: "application:write", description: "" }),
          mockPermission({ name: "job:read", description: "" }),
        ]),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() =>
      expect(screen.getByText(/3 permissions/)).toBeInTheDocument(),
    )
    expect(screen.getByText(/2 namespaces/)).toBeInTheDocument()
  })

  it("shows error banner when fetch fails", async () => {
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )
    render(<PermissionsTable />)
    await waitFor(() =>
      expect(screen.getByText("Failed to load permissions.")).toBeInTheDocument(),
    )
  })
})
