import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../../../mocks/server"
import { apiSuccess, mockRole } from "../../../mocks/handlers"
import { UserRolesPanel } from "@/components/roles/user-roles-panel"
import type { AdminUserRole } from "@/types/admin-user"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

function renderPanel({
  username = "johndoe",
  isAdmin = false,
  isHrManager = false,
  targetUserRole = "HR" as AdminUserRole,
} = {}) {
  return render(
    <UserRolesPanel
      username={username}
      isAdmin={isAdmin}
      isHrManager={isHrManager}
      targetUserRole={targetUserRole}
    />,
  )
}

describe("UserRolesPanel", () => {
  it("shows loading skeleton while roles are fetching", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, async () => {
        await new Promise((r) => setTimeout(r, 30))
        return apiSuccess(["HR"])
      }),
    )
    renderPanel()
    expect(screen.getByText("Loading roles…")).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText("Loading roles…")).not.toBeInTheDocument(),
    )
  })

  it("renders role badges for each assigned role", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () =>
        apiSuccess(["HR", "HR_CUSTOM"]),
      ),
    )
    renderPanel()
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())
    expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument()
  })

  it("shows 'No roles assigned.' when role list is empty", async () => {
    server.use(
      http.get(`${API}/auth/users/:username/roles`, () => apiSuccess([])),
    )
    renderPanel()
    await waitFor(() =>
      expect(screen.getByText("No roles assigned.")).toBeInTheDocument(),
    )
  })

  describe("Manage Roles button visibility", () => {
    it("visible for admin regardless of targetUserRole", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["ADMIN"])),
      )
      renderPanel({ isAdmin: true, targetUserRole: "ADMIN" })
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /manage roles/i })).toBeInTheDocument(),
      )
    })

    it("visible for HRM when targeting an HR user", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
      )
      renderPanel({ isAdmin: false, isHrManager: true, targetUserRole: "HR" })
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /manage roles/i })).toBeInTheDocument(),
      )
    })

    it("hidden for HRM when targeting an HR_MANAGER user", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR_MANAGER"])),
      )
      renderPanel({ isAdmin: false, isHrManager: true, targetUserRole: "HR_MANAGER" })
      await waitFor(() => expect(screen.queryByText("Loading roles…")).not.toBeInTheDocument())
      expect(screen.queryByRole("button", { name: /manage roles/i })).not.toBeInTheDocument()
    })

    it("hidden for non-admin and non-HRM users", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
      )
      renderPanel({ isAdmin: false, isHrManager: false, targetUserRole: "HR" })
      await waitFor(() => expect(screen.queryByText("Loading roles…")).not.toBeInTheDocument())
      expect(screen.queryByRole("button", { name: /manage roles/i })).not.toBeInTheDocument()
    })
  })

  describe("Modal interactions", () => {
    it("clicking Manage Roles opens the dialog with UserRolesEditPicker", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR", permissions: [] })]),
        ),
      )
      renderPanel({ isAdmin: true, targetUserRole: "HR" })
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /manage roles/i })).toBeInTheDocument(),
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole("button", { name: /manage roles/i }))

      const dialog = await waitFor(() => screen.getByRole("dialog"))
      // Dialog title is present inside the dialog
      expect(dialog).toHaveTextContent("Manage Roles")
    })

    it("Cancel button inside picker closes the dialog", async () => {
      server.use(
        http.get(`${API}/auth/users/:username/roles`, () => apiSuccess(["HR"])),
        http.get(`${API}/auth/roles`, () =>
          apiSuccess([mockRole({ name: "HR", permissions: [] })]),
        ),
      )
      renderPanel({ isAdmin: true, targetUserRole: "HR" })
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /manage roles/i })).toBeInTheDocument(),
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole("button", { name: /manage roles/i }))
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument())

      await user.click(screen.getByRole("button", { name: /cancel/i }))
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      )
    })
  })
})
