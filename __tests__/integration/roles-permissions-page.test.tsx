/**
 * Integration tests — RolesPermissionsClient
 * Renders the full tab + table tree; MSW intercepts real service HTTP calls.
 * Tests tab navigation, HRM vs Admin view differences, CRUD flows, and error states.
 */
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../mocks/server"
import { apiSuccess, mockRole, mockPermission } from "../mocks/handlers"
import { RolesPermissionsClient } from "@/components/roles/roles-permissions-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { toast } from "sonner"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupRolesHandler(roles = [mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] })]) {
  server.use(http.get(`${API}/auth/roles`, () => apiSuccess(roles)))
}

function setupPermissionsHandler(perms = [mockPermission()]) {
  server.use(http.get(`${API}/auth/permissions`, () => apiSuccess(perms)))
}

// ── Tab navigation ────────────────────────────────────────────────────────────

describe("Tab navigation", () => {
  it("Roles tab is active by default — RolesTable visible", async () => {
    setupRolesHandler()
    render(<RolesPermissionsClient isAdmin={false} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    // Permissions table should not be rendered yet
    expect(screen.queryByPlaceholderText("Search permissions…")).not.toBeInTheDocument()
  })

  it("clicking Permissions tab switches to PermissionsTable", async () => {
    setupRolesHandler()
    setupPermissionsHandler([mockPermission({ name: "application:read", description: "Read" })])
    render(<RolesPermissionsClient isAdmin={false} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /permissions/i }))

    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search permissions…")).toBeInTheDocument(),
    )
    expect(screen.queryByPlaceholderText("Search roles…")).not.toBeInTheDocument()
  })

  it("switching back to Roles tab shows RolesTable again", async () => {
    setupRolesHandler()
    setupPermissionsHandler()
    render(<RolesPermissionsClient isAdmin={false} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /permissions/i }))
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search permissions…")).toBeInTheDocument(),
    )

    await user.click(screen.getByRole("button", { name: /^roles$/i }))
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search roles…")).toBeInTheDocument(),
    )
  })
})

// ── HRM view (isAdmin=false) ──────────────────────────────────────────────────

describe("HRM view (isAdmin=false)", () => {
  it("loads and displays roles", async () => {
    setupRolesHandler([
      mockRole({ name: "HR", permissions: [] }),
      mockRole({ name: "HR_CUSTOM", permissions: ["application:read"] }),
    ])
    render(<RolesPermissionsClient isAdmin={false} />)

    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())
    expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument()
  })

  it("no clone or delete buttons visible", async () => {
    setupRolesHandler()
    render(<RolesPermissionsClient isAdmin={false} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    expect(screen.queryByTitle("Clone")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
  })

  it("permissions tab loads and shows namespace groups", async () => {
    setupRolesHandler()
    setupPermissionsHandler([
      mockPermission({ name: "application:read", description: "Read apps" }),
      mockPermission({ name: "job:read", description: "Read jobs" }),
    ])
    render(<RolesPermissionsClient isAdmin={false} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /permissions/i }))

    await waitFor(() =>
      expect(screen.getByText("application:read")).toBeInTheDocument(),
    )
    expect(screen.getByText("job:read")).toBeInTheDocument()
  })
})

// ── Admin view (isAdmin=true) ─────────────────────────────────────────────────

describe("Admin view (isAdmin=true)", () => {
  it("clone button visible for roles", async () => {
    setupRolesHandler()
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    expect(screen.getByTitle("Clone")).toBeInTheDocument()
  })

  it("delete button absent for built-in roles", async () => {
    setupRolesHandler([mockRole({ name: "ADMIN", permissions: [] })])
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("ADMIN")).toBeInTheDocument())
    expect(screen.queryByTitle("Delete")).not.toBeInTheDocument()
  })

  it("delete button present for custom roles", async () => {
    setupRolesHandler([mockRole({ name: "HR_CUSTOM", permissions: [] })])
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    expect(screen.getByTitle("Delete")).toBeInTheDocument()
  })

  it("clone flow: submitting with invalid name shows validation error", async () => {
    setupRolesHandler([mockRole({ name: "HR_CUSTOM", permissions: [] })])
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByTitle("Clone"))
    const dialog = await waitFor(() => screen.getByRole("dialog"))

    // First textbox in the dialog is the Role Name input (pre-filled with "HR_")
    const [nameInput] = within(dialog).getAllByRole("textbox")
    await user.clear(nameInput)
    await user.type(nameInput, "invalid-name")
    await user.click(within(dialog).getByRole("button", { name: /create role/i }))

    await waitFor(() =>
      expect(within(dialog).getByText(/uppercase letters and underscores only/i)).toBeInTheDocument(),
    )
  })

  it("clone flow: valid submission calls POST, shows success toast, closes modal", async () => {
    setupRolesHandler([mockRole({ name: "HR_CUSTOM", permissions: [] })])
    let cloneCalled = false
    server.use(
      http.post(`${API}/auth/roles/:sourceName/clone`, () => {
        cloneCalled = true
        return apiSuccess(mockRole({ name: "HR_CUSTOM_SENIOR" }))
      }),
    )
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByTitle("Clone"))
    const dialog = await waitFor(() => screen.getByRole("dialog"))

    // Textbox[0] = name, textbox[1] = description
    const [nameInput, descInput] = within(dialog).getAllByRole("textbox")
    await user.clear(nameInput)
    await user.type(nameInput, "HR_CUSTOM_SENIOR")
    await user.type(descInput, "Senior custom HR role")

    await user.click(within(dialog).getByRole("button", { name: /create role/i }))

    await waitFor(() => expect(cloneCalled).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Role "HR_CUSTOM_SENIOR" created')
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    )
  })

  it("delete flow: confirm triggers DELETE and shows success toast", async () => {
    setupRolesHandler([mockRole({ name: "HR_CUSTOM", permissions: [] })])
    let deleteCalled = false
    server.use(
      http.delete(`${API}/auth/roles/:roleName`, () => {
        deleteCalled = true
        return HttpResponse.json({ success: true, message: "Deleted" })
      }),
    )
    render(<RolesPermissionsClient isAdmin={true} />)

    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByTitle("Delete"))
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /delete role/i }))
    await waitFor(() => expect(deleteCalled).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Role "HR_CUSTOM" deleted')
  })
})

// ── Error states ──────────────────────────────────────────────────────────────

describe("Error states", () => {
  it("/auth/roles 500 → error banner in roles tab", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )
    render(<RolesPermissionsClient isAdmin={false} />)

    await waitFor(() =>
      expect(screen.getByText("Failed to load roles.")).toBeInTheDocument(),
    )
  })

  it("/auth/permissions 500 → error banner in permissions tab", async () => {
    setupRolesHandler()
    server.use(
      http.get(`${API}/auth/permissions`, () =>
        HttpResponse.json({ success: false }, { status: 500 }),
      ),
    )
    render(<RolesPermissionsClient isAdmin={false} />)

    const user = userEvent.setup()
    // Load roles first so we can switch tabs
    await waitFor(() => expect(screen.getByText("HR_CUSTOM")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /permissions/i }))

    await waitFor(() =>
      expect(screen.getByText("Failed to load permissions.")).toBeInTheDocument(),
    )
  })
})
