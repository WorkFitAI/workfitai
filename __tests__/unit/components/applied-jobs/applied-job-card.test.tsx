import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppliedJobCard from '@/components/applied-jobs/applied-job-card'
import { mockApplication } from '../../../mocks/handlers'
import type { ApplicationStatus } from '@/types/application'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/application/application-service', () => ({
  applicationService: {
    withdrawApplication: vi.fn().mockResolvedValue(undefined),
  },
}))

beforeEach(() => mockPush.mockClear())

describe('AppliedJobCard', () => {
  it('renders job title and company name from jobSnapshot', () => {
    const app = mockApplication()
    render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    const app = mockApplication({ status: 'REVIEWING' })
    render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
    expect(screen.getByText('Reviewing')).toBeInTheDocument()
  })

  it('renders applied date formatted correctly', () => {
    const app = mockApplication({ createdAt: '2026-01-15T08:00:00Z' })
    render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
    expect(screen.getByText(/jan 15, 2026/i)).toBeInTheDocument()
  })

  it('falls back to "—" when jobSnapshot is missing', () => {
    const app = mockApplication({ jobSnapshot: undefined as never })
    render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it.each<ApplicationStatus>(['DRAFT', 'APPLIED', 'REVIEWING'])(
    'shows withdraw button for withdrawable status: %s',
    (status) => {
      const app = mockApplication({ status })
      render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
      // Withdraw dialog trigger renders a Trash2 icon button with title
      expect(screen.getByTitle('Withdraw application')).toBeInTheDocument()
    }
  )

  it.each<ApplicationStatus>(['OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'])(
    'hides withdraw button for non-withdrawable status: %s',
    (status) => {
      const app = mockApplication({ status })
      render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
      expect(screen.queryByTitle('Withdraw application')).not.toBeInTheDocument()
    }
  )

  it('navigates to detail page on main area click', async () => {
    const app = mockApplication({ id: 'app-999' })
    render(<AppliedJobCard application={app} onWithdrawn={vi.fn()} />)
    await userEvent.click(screen.getByText('Frontend Engineer'))
    expect(mockPush).toHaveBeenCalledWith('/applied-jobs/app-999')
  })
})
