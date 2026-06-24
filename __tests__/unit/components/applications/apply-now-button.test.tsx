import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplyNowButton from '@/components/applications/apply-now-button'

const mockPush = vi.fn()
const mockPathname = '/jobs/job-001'
const mockOpenApplyModal = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}))

vi.mock('@/contexts/apply-modal-context', () => ({
  useApplyModal: () => ({ openApplyModal: mockOpenApplyModal }),
}))

// Default auth mock — overridden per test
const mockUseAuth = vi.fn()
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

// Default service mock — overridden per test
const mockCheckApplied = vi.fn()
vi.mock('@/lib/application/application-service', () => ({
  applicationService: {
    checkApplied: (...args: unknown[]) => mockCheckApplied(...args),
  },
}))

function authGuest() {
  mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, isLoading: false })
}

function authLoading() {
  mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, isLoading: true })
}

function authCandidate() {
  mockUseAuth.mockReturnValue({
    isAuthenticated: true,
    user: { username: 'testuser', roles: ['ROLE_CANDIDATE'] },
    isLoading: false,
  })
}

beforeEach(() => {
  mockPush.mockClear()
  mockOpenApplyModal.mockClear()
  mockCheckApplied.mockClear()
  mockCheckApplied.mockResolvedValue({ data: { applied: false } })
})

describe('ApplyNowButton', () => {
  it('shows pulse skeleton while auth is loading', () => {
    authLoading()
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('animate-pulse')
  })

  it('shows pulse skeleton while check-applied is in flight', async () => {
    authCandidate()
    // Never resolves during the render
    mockCheckApplied.mockReturnValue(new Promise(() => {}))
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('animate-pulse')
  })

  it('shows disabled "Applied" button when candidate already applied', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: true, applicationId: 'app-001' } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await waitFor(() => expect(screen.getByText(/applied/i)).toBeInTheDocument())
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows default "Apply Now" label when candidate has not applied', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: false } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await waitFor(() => {
      const btn = screen.getByRole('button')
      expect(btn).not.toBeDisabled()
      expect(btn).toHaveTextContent('Apply Now')
    })
  })

  it('uses custom label when provided', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: false } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" label="Quick Apply" />)
    await waitFor(() => expect(screen.getByText('Quick Apply')).toBeInTheDocument())
  })

  it('redirects to login with next param when unauthenticated user clicks', async () => {
    authGuest()
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/login?next=')
    )
  })

  it('opens apply modal when authenticated candidate clicks not-applied button', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: false } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled())
    await userEvent.click(screen.getByRole('button'))
    expect(mockOpenApplyModal).toHaveBeenCalledWith('job-001', 'Frontend Engineer')
  })

  it('falls back to not-applied state when checkApplied throws', async () => {
    authCandidate()
    mockCheckApplied.mockRejectedValue(new Error('Network error'))
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await waitFor(() => {
      const btn = screen.getByRole('button')
      expect(btn).not.toBeDisabled()
      expect(btn).toHaveTextContent('Apply Now')
    })
  })

  it('renders icon-only with aria-label when iconOnly is set', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: false } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" iconOnly />)
    await waitFor(() => {
      const btn = screen.getByRole('button')
      expect(btn).not.toBeDisabled()
      expect(btn).not.toHaveTextContent('Apply Now')
      expect(btn).toHaveAttribute('aria-label', 'Apply Now')
    })
  })

  it('renders icon-only "Applied" state with accessible label but no visible text', async () => {
    authCandidate()
    mockCheckApplied.mockResolvedValue({ data: { applied: true, applicationId: 'app-001' } })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" iconOnly />)
    await waitFor(() => {
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
      expect(btn).not.toHaveTextContent('Applied')
      expect(btn).toHaveAttribute('aria-label', 'Applied')
    })
  })

  it('does not call checkApplied for non-candidate authenticated users', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'hruser', roles: ['ROLE_HR'] },
      isLoading: false,
    })
    render(<ApplyNowButton jobId="job-001" jobTitle="Frontend Engineer" />)
    await new Promise(r => setTimeout(r, 50))
    expect(mockCheckApplied).not.toHaveBeenCalled()
    // HR user sees the default apply button (backend will handle rejection)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
