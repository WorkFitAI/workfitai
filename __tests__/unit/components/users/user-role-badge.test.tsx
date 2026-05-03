import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { UserRoleBadge } from "@/components/users/user-role-badge"

describe("UserRoleBadge", () => {
  it("should render CANDIDATE role with blue styling", () => {
    render(<UserRoleBadge role="CANDIDATE" />)
    const badge = screen.getByText("Candidate")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-blue-100")
    expect(badge).toHaveClass("text-blue-700")
  })

  it("should render HR role with green styling", () => {
    render(<UserRoleBadge role="HR" />)
    const badge = screen.getByText("HR")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-green-100")
    expect(badge).toHaveClass("text-green-700")
  })

  it("should render HR_MANAGER role with orange styling", () => {
    render(<UserRoleBadge role="HR_MANAGER" />)
    const badge = screen.getByText("HR Manager")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-orange-100")
    expect(badge).toHaveClass("text-orange-700")
  })

  it("should render ADMIN role with red styling", () => {
    render(<UserRoleBadge role="ADMIN" />)
    const badge = screen.getByText("Admin")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-red-100")
    expect(badge).toHaveClass("text-red-700")
  })

  it("should apply custom className", () => {
    const { container } = render(
      <UserRoleBadge role="CANDIDATE" className="custom-class" />
    )
    const span = container.querySelector("span")
    expect(span).toHaveClass("custom-class")
  })

  it("should have ring styling for all roles", () => {
    const roles = ["CANDIDATE", "HR", "HR_MANAGER", "ADMIN"] as const
    roles.forEach((role) => {
      const { container } = render(<UserRoleBadge role={role} />)
      const span = container.querySelector("span")
      expect(span).toHaveClass("ring-1")
      expect(span).toHaveClass("ring-inset")
    })
  })

  it("should have correct badge styling classes", () => {
    const { container } = render(<UserRoleBadge role="HR" />)
    const span = container.querySelector("span")
    expect(span).toHaveClass("inline-flex")
    expect(span).toHaveClass("items-center")
    expect(span).toHaveClass("rounded-lg")
    expect(span).toHaveClass("px-2")
    expect(span).toHaveClass("py-0.5")
    expect(span).toHaveClass("text-xs")
    expect(span).toHaveClass("font-medium")
  })
})
