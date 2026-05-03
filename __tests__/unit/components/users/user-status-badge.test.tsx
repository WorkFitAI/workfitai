import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { UserStatusBadge } from "@/components/users/user-status-badge"

describe("UserStatusBadge", () => {
  it("should render ACTIVE status with green styling", () => {
    render(<UserStatusBadge status="ACTIVE" />)
    const badge = screen.getByText("Active")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-green-100")
    expect(badge).toHaveClass("text-green-700")
  })

  it("should render INACTIVE status with gray styling", () => {
    render(<UserStatusBadge status="INACTIVE" />)
    const badge = screen.getByText("Inactive")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-gray-100")
    expect(badge).toHaveClass("text-gray-600")
  })

  it("should render BLOCKED status with red styling", () => {
    render(<UserStatusBadge status="BLOCKED" />)
    const badge = screen.getByText("Blocked")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-red-100")
    expect(badge).toHaveClass("text-red-700")
  })

  it("should render SUSPENDED status with orange styling", () => {
    render(<UserStatusBadge status="SUSPENDED" />)
    const badge = screen.getByText("Suspended")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-orange-100")
    expect(badge).toHaveClass("text-orange-700")
  })

  it("should render DEACTIVATED status with yellow styling", () => {
    render(<UserStatusBadge status="DEACTIVATED" />)
    const badge = screen.getByText("Deactivated")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-yellow-100")
    expect(badge).toHaveClass("text-yellow-700")
  })

  it("should render WAIT_APPROVED status with amber styling", () => {
    render(<UserStatusBadge status="WAIT_APPROVED" />)
    const badge = screen.getByText("Pending")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-amber-100")
    expect(badge).toHaveClass("text-amber-700")
  })

  it("should apply custom className", () => {
    const { container } = render(
      <UserStatusBadge status="ACTIVE" className="custom-class" />
    )
    const span = container.querySelector("span")
    expect(span).toHaveClass("custom-class")
  })

  it("should fall back to INACTIVE config for unknown status", () => {
    render(<UserStatusBadge status={"UNKNOWN" as any} />)
    const badge = screen.getByText("Inactive")
    expect(badge).toHaveClass("bg-gray-100")
  })

  it("should have correct badge styling classes", () => {
    const { container } = render(<UserStatusBadge status="ACTIVE" />)
    const span = container.querySelector("span")
    expect(span).toHaveClass("inline-flex")
    expect(span).toHaveClass("items-center")
    expect(span).toHaveClass("rounded-lg")
    expect(span).toHaveClass("px-2")
    expect(span).toHaveClass("py-0.5")
    expect(span).toHaveClass("text-xs")
    expect(span).toHaveClass("font-medium")
    expect(span).toHaveClass("ring-1")
    expect(span).toHaveClass("ring-inset")
  })

  it("should render all statuses with ring styling", () => {
    const statuses = [
      "ACTIVE",
      "INACTIVE",
      "BLOCKED",
      "SUSPENDED",
      "DEACTIVATED",
      "WAIT_APPROVED",
    ] as const

    statuses.forEach((status) => {
      const { container } = render(<UserStatusBadge status={status} />)
      const span = container.querySelector("span")
      expect(span).toHaveClass("ring-1")
      expect(span).toHaveClass("ring-inset")
    })
  })
})
