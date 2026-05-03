import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ApprovalQueueButton } from "@/components/users/approval-queue"
import { useApprovalQueue } from "@/hooks/useAdminUsers"

vi.mock("@/hooks/useAdminUsers")

describe("ApprovalQueueButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return null when userRoles is undefined", () => {
    const { container } = render(<ApprovalQueueButton userRoles={undefined} />)
    expect(container.firstChild).toBe(null)
  })

  it("should return null when roles don't include ROLE_ADMIN or ROLE_HR_MANAGER", () => {
    const { container } = render(
      <ApprovalQueueButton userRoles={["ROLE_CANDIDATE"]} />
    )
    expect(container.firstChild).toBe(null)
  })

  it("should return null for empty roles array", () => {
    const { container } = render(<ApprovalQueueButton userRoles={[]} />)
    expect(container.firstChild).toBe(null)
  })

  it("should render FAB button when role is ROLE_ADMIN", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.getByText("Approvals")).toBeInTheDocument()
  })

  it("should render FAB button when role is ROLE_HR_MANAGER", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_HR_MANAGER"]} />)

    expect(screen.getByText("Approvals")).toBeInTheDocument()
  })

  it("should show count badge when totalHits > 0", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 5,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("should show '99+' when totalHits > 99", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 150,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.getByText("99+")).toBeInTheDocument()
  })

  it("should not show count badge when totalHits = 0", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("should open modal when clicking FAB", async () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    const fabButton = screen.getByText("Approvals")
    fireEvent.click(fabButton)

    await waitFor(() => {
      expect(screen.getByText("Pending Approvals")).toBeInTheDocument()
    })
  })

  it("should have 'Pending Approvals' header in modal", async () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 3,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    const fabButton = screen.getByText("Approvals")
    fireEvent.click(fabButton)

    await waitFor(() => {
      expect(screen.getByText("Pending Approvals")).toBeInTheDocument()
      expect(screen.getByText("3 waiting for review")).toBeInTheDocument()
    })
  })

  it("should close modal when clicking X button", async () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    const fabButton = screen.getByText("Approvals")
    fireEvent.click(fabButton)

    await waitFor(() => {
      expect(screen.getByText("Pending Approvals")).toBeInTheDocument()
    })

    const closeButton = screen.getByRole("button", { name: "" }).parentElement
      ?.querySelector('button:nth-child(2)')
    if (closeButton) {
      fireEvent.click(closeButton)
    }
  })

  it("should work with multiple roles", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 0,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(
      <ApprovalQueueButton
        userRoles={["ROLE_CANDIDATE", "ROLE_ADMIN", "OTHER_ROLE"]}
      />
    )

    expect(screen.getByText("Approvals")).toBeInTheDocument()
  })

  it("should show count 1 when totalHits = 1", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 1,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("should show count badge for exact 99", () => {
    vi.mocked(useApprovalQueue).mockReturnValue({
      queue: [],
      totalHits: 99,
      roleAggregations: {},
      loading: false,
      error: null,
      approvingId: null,
      approve: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<ApprovalQueueButton userRoles={["ROLE_ADMIN"]} />)

    expect(screen.getByText("99")).toBeInTheDocument()
  })
})
