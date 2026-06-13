import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http } from "msw"
import { server } from "../../../mocks/server"
import { apiSuccess, mockRole } from "../../../mocks/handlers"
import { UserRolesEditPicker } from "@/components/roles/user-roles-edit-picker"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://be.workfitai.uk"

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderPicker({
  isAdmin = false,
  primaryRole = "HR",
  currentRoles = ["HR"],
  saving = false,
  onSave = vi.fn(),
  onCancel = vi.fn(),
} = {}) {
  return render(
    <UserRolesEditPicker
      isAdmin={isAdmin}
      primaryRole={primaryRole}
      currentRoles={currentRoles}
      saving={saving}
      onSave={onSave}
      onCancel={onCancel}
    />,
  )
}

describe("UserRolesEditPicker", () => {
  it("shows loading indicator while roles are fetching", async () => {
    server.use(
      http.get(`${API}/auth/roles`, async () => {
        await new Promise((r) => setTimeout(r, 30))
        return apiSuccess([mockRole({ name: "HR", permissions: [] })])
      }),
    )
    renderPicker()
    expect(screen.getByText("Loading available roles…")).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText("Loading available roles…")).not.toBeInTheDocument(),
    )
  })

  it("shows empty state when no roles match the primary role scope", async () => {
    // Return only ADMIN-scoped roles; primaryRole is HR — no matches
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "ADMIN_CUSTOM", permissions: [] })]),
      ),
    )
    renderPicker({ primaryRole: "HR" })
    await waitFor(() =>
      expect(screen.getByText(/No additional roles in the/)).toBeInTheDocument(),
    )
    expect(screen.getByText("HR")).toBeInTheDocument() // scope name shown in message
  })

  it("filters roles to only those matching primaryRole scope", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([
          mockRole({ name: "HR", permissions: [] }),
          mockRole({ name: "HR_SENIOR", permissions: [] }),
          mockRole({ name: "ADMIN_CUSTOM", permissions: [] }),
        ]),
      ),
    )
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"] })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    expect(screen.getByText("HR_SENIOR")).toBeInTheDocument()
    expect(screen.queryByText("ADMIN_CUSTOM")).not.toBeInTheDocument()
  })

  it("primary role checkbox is disabled and always checked", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"] })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    // Locked indicator appears next to primary role
    expect(screen.getByText(/primary · locked/i)).toBeInTheDocument()

    // The checkbox for the primary role should be disabled
    const checkboxes = screen.getAllByRole("checkbox")
    const primaryCheckbox = checkboxes[0]
    expect(primaryCheckbox).toBeDisabled()
    expect(primaryCheckbox).toBeChecked()
  })

  it("non-primary roles can be toggled on", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([
          mockRole({ name: "HR", permissions: [] }),
          mockRole({ name: "HR_SENIOR", permissions: [] }),
        ]),
      ),
    )
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"] })
    await waitFor(() => expect(screen.getByText("HR_SENIOR")).toBeInTheDocument())

    const user = userEvent.setup()
    const checkboxes = screen.getAllByRole("checkbox")
    // HR is index 0 (primary/locked), HR_SENIOR is index 1
    const seniorCheckbox = checkboxes[1]
    expect(seniorCheckbox).not.toBeChecked()

    await user.click(seniorCheckbox)
    expect(seniorCheckbox).toBeChecked()
  })

  it("Save Changes button is disabled when there is no diff from currentRoles", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"] })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    const saveButton = screen.getByRole("button", { name: /save changes/i })
    expect(saveButton).toBeDisabled()
  })

  it("Save Changes button is enabled after toggling a role", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([
          mockRole({ name: "HR", permissions: [] }),
          mockRole({ name: "HR_SENIOR", permissions: [] }),
        ]),
      ),
    )
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"] })
    await waitFor(() => expect(screen.getByText("HR_SENIOR")).toBeInTheDocument())

    const user = userEvent.setup()
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[1]) // toggle HR_SENIOR on

    expect(screen.getByRole("button", { name: /save changes/i })).not.toBeDisabled()
  })

  it("calls onSave with updated roles list when Save is clicked", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([
          mockRole({ name: "HR", permissions: [] }),
          mockRole({ name: "HR_SENIOR", permissions: [] }),
        ]),
      ),
    )
    const onSave = vi.fn()
    renderPicker({ primaryRole: "HR", currentRoles: ["HR"], onSave })
    await waitFor(() => expect(screen.getByText("HR_SENIOR")).toBeInTheDocument())

    const user = userEvent.setup()
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[1]) // add HR_SENIOR

    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(onSave).toHaveBeenCalledOnce()
    const savedRoles: string[] = onSave.mock.calls[0][0]
    expect(savedRoles).toContain("HR")
    expect(savedRoles).toContain("HR_SENIOR")
  })

  it("calls onCancel when Cancel is clicked", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    const onCancel = vi.fn()
    renderPicker({ onCancel })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("shows admin note when isAdmin=true", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    renderPicker({ isAdmin: true })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())
    expect(screen.getByText(/changes take effect on the user/i)).toBeInTheDocument()
  })

  it("does not show admin note when isAdmin=false", async () => {
    server.use(
      http.get(`${API}/auth/roles`, () =>
        apiSuccess([mockRole({ name: "HR", permissions: [] })]),
      ),
    )
    renderPicker({ isAdmin: false })
    await waitFor(() => expect(screen.getByText("HR")).toBeInTheDocument())
    expect(screen.queryByText(/changes take effect on the user/i)).not.toBeInTheDocument()
  })
})
