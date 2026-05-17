/**
 * Unit tests — ApplicationWithdrawDialog component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationWithdrawDialog from '@/components/applied-jobs/application-withdraw-dialog'

const mockPush = vi.fn()

// Override the global next/navigation mock from setup.ts with a controllable push
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/applied-jobs/app-001',
  useSearchParams: () => new URLSearchParams(),
}))

const mockWithdrawApplication = vi.fn()

vi.mock('@/lib/application/application-service', () => ({
  applicationService: {
    withdrawApplication: (...args: unknown[]) => mockWithdrawApplication(...args),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockWithdrawApplication.mockResolvedValue(undefined)
})

describe('ApplicationWithdrawDialog', () => {
  it('renders "Withdraw Application" button by default (iconOnly=false)', () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Frontend Engineer"
      />,
    )
    expect(screen.getByRole('button', { name: /Withdraw Application/i })).toBeInTheDocument()
  })

  it('renders an icon-only button when iconOnly=true', () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Frontend Engineer"
        iconOnly={true}
      />,
    )
    // Icon button uses title attribute
    expect(screen.getByTitle('Withdraw application')).toBeInTheDocument()
  })

  it('opens dialog showing "Withdraw application?" title when trigger is clicked', async () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Frontend Engineer"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Withdraw Application/i }))
    expect(await screen.findByText('Withdraw application?')).toBeInTheDocument()
  })

  it('shows the jobTitle in the dialog description', async () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Senior React Developer"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Withdraw Application/i }))
    expect(await screen.findByText('Senior React Developer')).toBeInTheDocument()
  })

  it('calls withdrawApplication with applicationId when "Yes, withdraw" is clicked', async () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-xyz"
        jobTitle="Frontend Engineer"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Withdraw Application/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Yes, withdraw/i }))

    await waitFor(() => {
      expect(mockWithdrawApplication).toHaveBeenCalledWith('app-xyz')
    })
  })

  it('calls onWithdrawn callback after successful withdrawal', async () => {
    const onWithdrawn = vi.fn()
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Frontend Engineer"
        onWithdrawn={onWithdrawn}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Withdraw Application/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Yes, withdraw/i }))

    await waitFor(() => {
      expect(onWithdrawn).toHaveBeenCalled()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('navigates to /applied-jobs when no onWithdrawn callback is provided', async () => {
    render(
      <ApplicationWithdrawDialog
        applicationId="app-001"
        jobTitle="Frontend Engineer"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Withdraw Application/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Yes, withdraw/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/applied-jobs')
    })
  })
})
