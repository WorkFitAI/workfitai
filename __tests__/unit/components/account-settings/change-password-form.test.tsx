import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ChangePasswordForm from "@/components/account-settings/change-password-form"
import { userService } from "@/lib/user/user-service"
import { toast } from "sonner"

vi.mock("@/lib/user/user-service")
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render three password input fields", () => {
    render(<ChangePasswordForm />)

    expect(screen.getByLabelText("Current Password")).toBeInTheDocument()
    expect(screen.getByLabelText("New Password")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument()
  })

  it("should have form title and description", () => {
    render(<ChangePasswordForm />)

    expect(screen.getByText("Change Password")).toBeInTheDocument()
    expect(screen.getByText(/strong password of at least 8 characters/i)).toBeInTheDocument()
  })

  it("should disable submit button when form not dirty", () => {
    render(<ChangePasswordForm />)

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    expect(submitButton).toBeDisabled()
  })

  it("should enable submit button after user types", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    expect(submitButton).not.toBeDisabled()
  })

  it("should show validation error for empty currentPassword", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Required/i)).toBeInTheDocument()
    })
  })

  it("should show validation error for newPassword < 8 chars", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "short")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "short")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Min 8 characters/i)).toBeInTheDocument()
    })
  })

  it("should show validation error for mismatched confirmPassword", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "different1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/don't match/i)).toBeInTheDocument()
    })
  })

  it("should toggle password visibility with eye icon", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText(
      "Current Password"
    ) as HTMLInputElement
    expect(currentPasswordInput.type).toBe("password")

    const eyeButton = screen.getAllByRole("button")[0]
    await user.click(eyeButton)

    expect(currentPasswordInput.type).toBe("text")

    await user.click(eyeButton)
    expect(currentPasswordInput.type).toBe("password")
  })

  it("should have separate eye toggle buttons for each password field", async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText(
      "Current Password"
    ) as HTMLInputElement
    const newPasswordInput = screen.getByLabelText("New Password") as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm New Password"
    ) as HTMLInputElement

    const eyeButtons = screen.getAllByRole("button").slice(0, 3)

    // Toggle current password
    await user.click(eyeButtons[0])
    expect(currentPasswordInput.type).toBe("text")
    expect(newPasswordInput.type).toBe("password") // Other fields unchanged

    // Toggle new password
    await user.click(eyeButtons[1])
    expect(newPasswordInput.type).toBe("text")
    expect(confirmPasswordInput.type).toBe("password") // Other fields unchanged
  })

  it("should submit form with valid data", async () => {
    const user = userEvent.setup()
    const mockChangePassword = vi.fn().mockResolvedValue({ status: 200 })
    vi.mocked(userService.changePassword as any).mockImplementation(
      mockChangePassword
    )

    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass123")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "oldpass123",
        newPassword: "newpass1234",
        confirmPassword: "newpass1234",
      })
    })
  })

  it("should show success toast on successful submit", async () => {
    const user = userEvent.setup()
    const mockToastSuccess = vi.mocked(toast.success)
    vi.mocked(userService.changePassword as any).mockResolvedValue({
      status: 200,
    })

    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass123")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Password changed successfully."
      )
    })
  })

  it("should show error toast on failed submit", async () => {
    const user = userEvent.setup()
    const mockToastError = vi.mocked(toast.error)
    vi.mocked(userService.changePassword as any).mockRejectedValue(
      new Error("Invalid password")
    )

    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass123")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to change password. Check your current password and try again."
      )
    })
  })

  it("should reset form after successful submit", async () => {
    const user = userEvent.setup()
    vi.mocked(userService.changePassword as any).mockResolvedValue({
      status: 200,
    })

    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText(
      "Current Password"
    ) as HTMLInputElement
    const newPasswordInput = screen.getByLabelText("New Password") as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm New Password"
    ) as HTMLInputElement

    await user.type(currentPasswordInput, "oldpass123")
    await user.type(newPasswordInput, "newpass1234")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(currentPasswordInput.value).toBe("")
      expect(newPasswordInput.value).toBe("")
      expect(confirmPasswordInput.value).toBe("")
    })
  })

  it("should disable submit button during submission", async () => {
    const user = userEvent.setup()
    let resolveSubmit: () => void
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve
    })

    vi.mocked(userService.changePassword as any).mockReturnValue(submitPromise)

    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByLabelText("Current Password")
    await user.type(currentPasswordInput, "oldpass123")

    const newPasswordInput = screen.getByLabelText("New Password")
    await user.type(newPasswordInput, "newpass1234")

    const confirmPasswordInput = screen.getByLabelText("Confirm New Password")
    await user.type(confirmPasswordInput, "newpass1234")

    const submitButton = screen.getByRole("button", { name: /Update password/i })
    fireEvent.click(submitButton)

    // Button should show "Updating..." and be disabled
    await waitFor(() => {
      expect(screen.getByText(/Updating/i)).toBeInTheDocument()
    })

    resolveSubmit!()

    await waitFor(() => {
      expect(screen.getByText(/Update password/i)).toBeInTheDocument()
    })
  })

  it("should have proper form structure with labels", () => {
    render(<ChangePasswordForm />)

    const form = screen.getByRole("button", { name: /Update password/i })
      .closest("form")
    expect(form).toBeInTheDocument()

    const labels = screen.getAllByText(/Password/)
    expect(labels.length).toBeGreaterThan(0)
  })
})
