import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useAdminUser } from "@/hooks/useAdminUsers"
import { UserDetail } from "@/components/users/user-detail"
import type { AdminUserSummary, AdminUserFullProfile } from "@/types/admin-user"

vi.mock("@/hooks/useAdminUsers")

function mockAdminUserSummary(
  overrides: Partial<AdminUserSummary> = {}
): AdminUserSummary {
  return {
    userId: "user-1",
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    phoneNumber: null,
    userRole: "CANDIDATE",
    userStatus: "ACTIVE",
    companyId: null,
    companyName: null,
    companyNo: null,
    department: null,
    address: null,
    createdBy: null,
    createdDate: "2026-01-01T00:00:00Z",
    lastModifiedBy: null,
    lastModifiedDate: null,
    deleted: false,
    ...overrides,
  }
}

function mockAdminUserFullProfile(
  overrides: Partial<AdminUserFullProfile> = {}
): AdminUserFullProfile {
  return {
    ...mockAdminUserSummary(overrides),
    careerObjective: "Seeking senior developer role",
    summary: "Experienced developer",
    totalExperience: 5,
    education: "BS in Computer Science",
    certifications: "AWS Certified",
    portfolioLink: "https://portfolio.example.com",
    linkedinUrl: "https://linkedin.com/in/testuser",
    githubUrl: "https://github.com/testuser",
    expectedPosition: "Senior Developer",
    cvIds: [],
    skills: ["JavaScript", "React", "Node.js"],
  }
}

describe("UserDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should show loader when loading=true", () => {
    vi.mocked(useAdminUser).mockReturnValue({
      user: null,
      fullProfile: null,
      loading: true,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText(/Loading user/i)).toBeInTheDocument()
  })

  it("should show error message when error set", async () => {
    vi.mocked(useAdminUser).mockReturnValue({
      user: null,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: "Failed to load user.",
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load user/i)).toBeInTheDocument()
    })
  })

  it("should show error message when user is null", () => {
    vi.mocked(useAdminUser).mockReturnValue({
      user: null,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText(/User not found/i)).toBeInTheDocument()
  })

  it("should show 'Back to Users' link on error", () => {
    vi.mocked(useAdminUser).mockReturnValue({
      user: null,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: "Error loading user",
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText(/Back to Users/i)).toBeInTheDocument()
  })

  it("should render user fullName, email, role badge, status badge when loaded", () => {
    const mockUser = mockAdminUserSummary({
      userId: "user-1",
      fullName: "John Smith",
      email: "john@example.com",
      userRole: "CANDIDATE",
      userStatus: "ACTIVE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getAllByText("John Smith").length).toBeGreaterThan(0)
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("should show 'Block' button for ACTIVE user", () => {
    const mockUser = mockAdminUserSummary({
      userStatus: "ACTIVE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    const blockButton = screen.getByText("Block")
    expect(blockButton).toBeInTheDocument()
  })

  it("should show 'Unblock' button for BLOCKED user", () => {
    const mockUser = mockAdminUserSummary({
      userStatus: "BLOCKED",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    const unblockButton = screen.getByText("Unblock")
    expect(unblockButton).toBeInTheDocument()
  })

  it("should call toggleBlock when clicking block button", () => {
    const mockToggleBlock = vi.fn()
    const mockUser = mockAdminUserSummary({
      userStatus: "ACTIVE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: mockToggleBlock,
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    const blockButton = screen.getByText("Block")
    fireEvent.click(blockButton)

    expect(mockToggleBlock).toHaveBeenCalled()
  })

  it("should auto-fetch full profile for CANDIDATE role", () => {
    const mockFetchFullProfile = vi.fn()
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: mockFetchFullProfile,
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(mockFetchFullProfile).toHaveBeenCalled()
  })

  it("should not auto-fetch full profile for non-CANDIDATE role", () => {
    const mockFetchFullProfile = vi.fn()
    const mockUser = mockAdminUserSummary({
      userRole: "HR",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: mockFetchFullProfile,
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(mockFetchFullProfile).not.toHaveBeenCalled()
  })

  it("should show full profile loading spinner", () => {
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: true,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument()
  })

  it("should render career profile section when fullProfile available", () => {
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })
    const mockProfile = mockAdminUserFullProfile({
      expectedPosition: "Senior Developer",
      careerObjective: "Looking for tech leadership roles",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: mockProfile,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText("Career Profile")).toBeInTheDocument()
    expect(screen.getByText("Senior Developer")).toBeInTheDocument()
  })

  it("should show Education & Skills section", () => {
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })
    const mockProfile = mockAdminUserFullProfile({
      education: "BS in Computer Science",
      skills: ["JavaScript", "React"],
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: mockProfile,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText("Education & Skills")).toBeInTheDocument()
    expect(screen.getByText("BS in Computer Science")).toBeInTheDocument()
    expect(screen.getByText("JavaScript")).toBeInTheDocument()
    expect(screen.getByText("React")).toBeInTheDocument()
  })

  it("should show Links section when URLs present", () => {
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })
    const mockProfile = mockAdminUserFullProfile({
      linkedinUrl: "https://linkedin.com/in/testuser",
      githubUrl: "https://github.com/testuser",
      portfolioLink: "https://portfolio.example.com",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: mockProfile,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText("Links")).toBeInTheDocument()
    expect(screen.getByText("LinkedIn")).toBeInTheDocument()
    expect(screen.getByText("GitHub")).toBeInTheDocument()
    expect(screen.getByText("Portfolio")).toBeInTheDocument()
  })

  it("should show Links section conditionally when URLs present", () => {
    const mockUser = mockAdminUserSummary({
      userRole: "CANDIDATE",
    })
    const mockProfile = mockAdminUserFullProfile({
      linkedinUrl: "https://linkedin.com/in/test",
      githubUrl: null,
      portfolioLink: null,
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: mockProfile,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    // Links section should appear when at least one URL is present
    expect(screen.getByText("Links")).toBeInTheDocument()
  })

  it("should display basic information section", () => {
    const mockUser = mockAdminUserSummary({
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "+1234567890",
      address: "123 Main St",
      companyName: "Tech Corp",
      department: "Engineering",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: false,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    expect(screen.getByText("Basic Information")).toBeInTheDocument()
    expect(screen.getByText("+1234567890")).toBeInTheDocument()
    expect(screen.getByText("123 Main St")).toBeInTheDocument()
    expect(screen.getByText("Tech Corp")).toBeInTheDocument()
  })

  it("should disable block button when blocking=true", () => {
    const mockUser = mockAdminUserSummary({
      userStatus: "ACTIVE",
    })

    vi.mocked(useAdminUser).mockReturnValue({
      user: mockUser,
      fullProfile: null,
      loading: false,
      fullProfileLoading: false,
      error: null,
      blocking: true,
      fetchFullProfile: vi.fn(),
      toggleBlock: vi.fn(),
      refresh: vi.fn(),
    } as any)

    render(<UserDetail userId="user-1" />)

    const blockButton = screen.getByText("Block")
    expect(blockButton).toBeDisabled()
  })
})
