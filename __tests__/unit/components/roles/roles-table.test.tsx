import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../../../mocks/server"
import { apiSuccess, mockRole } from "../../../mocks/handlers"
import { RolesTable } from "@/components/roles/roles-table"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function renderTable(isAdmin = false) {
  return render(<RolesTable isAdmin={isAdmin} />)
}

describe("RolesTable", () => {
  it("shows skeleton rows while loading then renders roles", async () => {
    server.use(
      http.get(`${API}/auth/roles`, async () => {
        await new Promise((r) => setTimeout(r, 20))
        return apiSuccess([mockRole({ name: "HR", description: "HR role", permissions: [] })])
      }),
    )

    renderTable()
    // Skeleton: table cells with animate-pulse present before data arrives
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)

    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())
    expect(document.querySelectorAll(".animate-pulse").length).toBe(0)
  })

  it("renders built-in badge for built-in roles", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "ADMIN", permissions: [] })]),
      ),
    )
    renderTable()
    await waitFor(() => expect(screen.getByText("ADMIN")).toBeInTheDocument())
    expect(screen.getByText("built-in")).toBeInTheDocument()
  })

  it("does not show built-in badge for custom roles", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR_CUSTOM", permissions: [] })]),
      ),
    )
    renderTable()
    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    expect(screen.queryByText("built-in")).not.toBeInTheDocument()
  })

  it("search filters roles by name", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([
          mockRole({ name: "HR", permissions: [] }),
          mockRole({ name: "ADMIN", permissions: [] }),
        ]),
      ),
    )
    renderTable()
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("Search roles…"), "ADMIN")

    expect(screen.queryByText("HR")).not.toBeInTheDocument()
    expect(screen.getByText("ADMIN")).toBeInTheDocument()
  })

  it("shows 'No roles match your search' when search yields no results", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    renderTable()
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText("Search roles…"), "NONEXISTENT")

    expect(screen.getByText("No roles match your search")).toBeInTheDocument()
  })

  it("shows 'No roles found' when the list is empty and no search is active", async () => {
    server.use(http.get(`${API}/auth/roles`, () => apiSuccess([])))
    renderTable()
    await waitFor(() => expect(screen.getByText("No roles found")).toBeInTheDocument())
  })

  it("shows error banner when fetch fails", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )
    renderTable()
    await waitFor(() =>
      expect(screen.getByText("Failed to load roles.")).toBeInTheDocument(),
    )
  })

  describe("isAdmin=false (HRM view)", () => {
    it("does not render clone or delete buttons", async () => {
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([
            mockRole({ name: "HR", permissions: [] }),
            mockRole({ name: "HR_CUSTOM", permissions: [] }),
          ]),
        ),
      )
      renderTable(false)
      await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

      expect(screen.queryByTitle("Clone")).not.toBeInTheDocument()
      expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
    })
  })

  describe("isAdmin=true (Admin view)", () => {
    it("renders clone button for all roles", async () => {
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([
            mockRole({ name: "HR", permissions: [] }),
            mockRole({ name: "HR_CUSTOM", permissions: [] }),
          ]),
        ),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

      const cloneButtons = screen.getAllByTitle("Clone")
      expect(cloneButtons).toHaveLength(2)
    })

    it("does not render delete button for built-in roles", async () => {
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "ADMIN", permissions: [] })]),
        ),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("ADMIN")).toBeInTheDocument())

      expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
    })

    it("renders delete button for custom roles", async () => {
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })]),
        ),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

      expect(screen.getByTitle("Delete")).toBeInTheDocument()
    })

    it("clicking View opens RoleDetailModal", async () => {
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR_CUSTOM", permissions: [] })]),
        ),
        http.get(`${API}/auth/roles/:name`, () =>
          apiSuccess(mockRole({ name: "HR_CUSTOM", permissions: [] })),
        ),
        http.get(`${API}/auth/permissions`, () => apiSuccess([])),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

      const user = userEvent.setup()
      await user.click(screen.getByTitle("View"))

      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument())
    })

    it("clicking Delete then Cancel does not call the delete API", async () => {
      let deleteCalled = false
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR_CUSTOM", permissions: [] })]),
        ),
        http.delete(`${API}/auth/roles/:roleName`, () => {
          deleteCalled = true
          return HttpResponse.json({ success: true })
        }),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

      const user = userEvent.setup()
      await user.click(screen.getByTitle("Delete"))
      // Confirm dialog should appear
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument())

      await user.click(screen.getByRole("button", { name: /cancel/i }))
      expect(deleteCalled).toBe(false)
    })

    it("clicking Delete then Confirm calls delete API", async () => {
      let deleteCalled = false
      server.use(
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR_CUSTOM", permissions: [] })]),
        ),
        http.delete(`${API}/auth/roles/:roleName`, () => {
          deleteCalled = true
          return HttpResponse.json({ success: true, message: "Deleted" })
        }),
      )
      renderTable(true)
      await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

      const user = userEvent.setup()
      await user.click(screen.getByTitle("Delete"))
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument())

      await user.click(screen.getByRole("button", { name: /delete role/i }))
      await waitFor(() => expect(deleteCalled).toBe(true))
    })
  })
})
