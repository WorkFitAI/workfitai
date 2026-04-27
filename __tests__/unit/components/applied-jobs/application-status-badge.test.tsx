import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ApplicationStatusBadge from '@/components/applied-jobs/application-status-badge'
import type { ApplicationStatus } from '@/types/application'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  INTERVIEW: 'Interview',
  OFFER: 'Offer Received',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

describe('ApplicationStatusBadge', () => {
  it.each(Object.entries(STATUS_LABELS) as [ApplicationStatus, string][])(
    'renders label "%s" for status %s',
    (status, label) => {
      render(<ApplicationStatusBadge status={status} />)
      expect(screen.getByText(label, { exact: false })).toBeInTheDocument()
    }
  )

  it('applies rounded-full class to badge', () => {
    const { container } = render(<ApplicationStatusBadge status="APPLIED" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('merges extra className prop', () => {
    const { container } = render(<ApplicationStatusBadge status="APPLIED" className="text-xs" />)
    expect(container.firstChild).toHaveClass('text-xs')
  })
})
