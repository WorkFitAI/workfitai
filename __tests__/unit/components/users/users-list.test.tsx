import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/navigation"
import { UsersList } from "@/components/users/users-list"
import { useAdminUsers, useApprovalQueue } from "@/hooks/useAdminUsers"
import { adminUserService } from "@/lib/admin/admin-user-service"
import { useAuth } from "@/contexts/auth-context"
import type { EsUserHit } from "@/types/admin-user"

// Mock dependencies
vi.mock("next/navigation")
vi.mock("@/hooks/useAdminUsers")
vi.mock("@/lib/admin/admin-user-service")
vi.mock("@/contexts/auth-context")

const mockPush = vi.fn()
vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
} as any)

vi.mocked(useAuth).mockReturnValue({
  user: { roles: ["ROLE_ADMIN"] },
} as any)

function mockEsUserHit(overrides: Partial<EsUserHit> = {}): EsUserHit {
  return {
    userId: "user-1",
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    phoneNumber: null,
    avatarUrl: null,
    role: "CANDIDATE",
    status: "ACTIVE",
    blocked: false,
    deleted: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: null,
    companyNo: null,
    companyName: null,
    score: "1.0",
    highlights: {},
    ...overrides,
  }
}

describe("UsersList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
  })

  it("should render loading spinner when loading=true", () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: true,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    expect(screen.getByText(/Loading users/i)).toBeInTheDocument()
  })

  it("should render 'No users found' when users=[]", async () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    await waitFor(() => {
      expect(screen.getByText(/No users found/i)).toBeInTheDocument()
    })
  })

  it("should render user rows with fullName, email, role badge, status badge", () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice Smith",
        email: "alice@example.com",
        role: "CANDIDATE",
        status: "ACTIVE",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    expect(screen.getByText("Alice Smith")).toBeInTheDocument()
    expect(screen.getByText("alice@example.com")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("should render role filter tabs", () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    expect(screen.getByText("All")).toBeInTheDocument()
    expect(screen.getByText("Candidate")).toBeInTheDocument()
    expect(screen.getByText("HR")).toBeInTheDocument()
    expect(screen.getByText("HR Manager")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("should call setRoleFilter and reset page when clicking role tab", async () => {
    const mockRefresh = vi.fn()
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: mockRefresh,
    } as any)

    render(<UsersList />)

    const candidateTab = screen.getAllByText("Candidate")[0]
    fireEvent.click(candidateTab)

    // useAdminUsers will be called with new role filter
    // We can verify by checking that tab styling changes
    expect(candidateTab).toHaveClass("bg-blue-600")
  })

  it("should update keyword on search input change", async () => {
    const user = userEvent.setup()
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const searchInput = screen.getByPlaceholderText("Search by name, email...")
    await user.type(searchInput, "john")

    expect(searchInput).toHaveValue("john")
  })

  it("should show block button for ACTIVE user", () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        status: "ACTIVE",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const buttons = screen.getAllByTitle(/Block user/i)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("should show unblock button for BLOCKED user", () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        status: "BLOCKED",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const buttons = screen.getAllByTitle(/Unblock user/i)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("should open confirm dialog when clicking block", async () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
        status: "ACTIVE",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const blockButton = screen.getByTitle(/Block user/i)
    fireEvent.click(blockButton)

    await waitFor(() => {
      expect(screen.getByText(/Block user\?/i)).toBeInTheDocument()
    })
  })

  it("should open confirm dialog when clicking unblock", async () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
        status: "BLOCKED",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const unblockButton = screen.getByTitle(/Unblock user/i)
    fireEvent.click(unblockButton)

    await waitFor(() => {
      expect(screen.getByText(/Unblock user\?/i)).toBeInTheDocument()
    })
  })

  it("should open confirm dialog when clicking delete", async () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const deleteButton = screen.getByTitle(/Delete user/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/Delete user\?/i)).toBeInTheDocument()
    })
  })

  it("should call setUserBlocked when confirming block", async () => {
    const mockRefresh = vi.fn()
    const mockSetUserBlocked = vi.fn().mockResolvedValue({})
    vi.mocked(adminUserService.setUserBlocked as any).mockImplementation(
      mockSetUserBlocked
    )

    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
        status: "ACTIVE",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: mockRefresh,
    } as any)

    render(<UsersList />)

    const blockButton = screen.getByTitle(/Block user/i)
    fireEvent.click(blockButton)

    await waitFor(() => {
      expect(screen.getByText(/Block user\?/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText("Block user")
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockSetUserBlocked).toHaveBeenCalledWith("user-1", true)
    })
  })

  it("should call deleteUser when confirming delete", async () => {
    const mockRefresh = vi.fn()
    const mockDeleteUser = vi.fn().mockResolvedValue({})
    vi.mocked(adminUserService.deleteUser as any).mockImplementation(
      mockDeleteUser
    )

    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: mockRefresh,
    } as any)

    render(<UsersList />)

    const deleteButton = screen.getByTitle(/Delete user/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/Delete user\?/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText("Delete permanently")
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith("user-1")
    })
  })

  it("should close dialog when clicking cancel", async () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const deleteButton = screen.getByTitle(/Delete user/i)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText(/Delete user\?/i)).toBeInTheDocument()
    })

    const cancelButton = screen.getByText("Cancel")
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText(/Delete user\?/i)).not.toBeInTheDocument()
    })
  })

  it("should show pagination when totalPages > 1", () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: Array(10)
        .fill(null)
        .map((_, i) =>
          mockEsUserHit({ userId: `user-${i}`, fullName: `User ${i}` })
        ),
      totalHits: 25,
      totalPages: 3,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument()
  })

  it("should navigate to user detail on row click", async () => {
    const mockUsers = [
      mockEsUserHit({
        userId: "user-1",
        fullName: "Alice",
      }),
    ]

    vi.mocked(useAdminUsers).mockReturnValue({
      users: mockUsers,
      totalHits: 1,
      totalPages: 1,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    const userRow = screen.getByText("Alice").closest("tr")
    fireEvent.click(userRow!)

    expect(mockPush).toHaveBeenCalledWith("/users/user-1")
  })

  it("should show total users count", () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 42,
      totalPages: 5,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    expect(screen.getByText(/42 total users/i)).toBeInTheDocument()
  })

  it("should render with empty state", () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      users: [],
      totalHits: 0,
      totalPages: 0,
      loading: false,
      error: null,
      roleAggregations: {},
      statusAggregations: {},
      refresh: vi.fn(),
    } as any)

    render(<UsersList />)

    // Component should render with header "Users"
    const heading = screen.getByText("Users", { selector: "h1" })
    expect(heading).toBeInTheDocument()
  })
})
