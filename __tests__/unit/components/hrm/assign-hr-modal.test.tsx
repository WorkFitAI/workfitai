/**
 * Unit tests — AssignHRModal component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignHRModal } from '@/components/hrm/assign-hr-modal'
import { mockHRUser } from '../../../mocks/handlers'

const baseProps = {
  isOpen: true,
  applicationId: 'app-001',
  currentAssignee: '',
  hrUsers: [mockHRUser()],
  loadingHRUsers: false,
  assigning: false,
  onAssign: vi.fn(),
  onClose: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AssignHRModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AssignHRModal {...baseProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Assign Application to HR" heading when open', () => {
    render(<AssignHRModal {...baseProps} />)
    expect(screen.getByText('Assign Application to HR')).toBeInTheDocument()
  })

  it('lists HR user fullName and @username', () => {
    const hr = mockHRUser({ fullName: 'Jane HR', username: 'janehr' })
    render(<AssignHRModal {...baseProps} hrUsers={[hr]} />)
    expect(screen.getByText('Jane HR')).toBeInTheDocument()
    expect(screen.getByText(/@janehr/)).toBeInTheDocument()
  })

  it('shows "Loading HR members…" when loadingHRUsers=true', () => {
    render(<AssignHRModal {...baseProps} loadingHRUsers={true} hrUsers={[]} />)
    expect(screen.getByText('Loading HR members…')).toBeInTheDocument()
  })

  it('shows "No HR members found" when hrUsers is empty and not loading', () => {
    render(<AssignHRModal {...baseProps} hrUsers={[]} />)
    expect(screen.getByText('No HR members found')).toBeInTheDocument()
  })

  it('calls onAssign with applicationId and selected username when Assign is clicked', async () => {
    const onAssign = vi.fn()
    const hr = mockHRUser({ username: 'hrtest1' })
    render(
      <AssignHRModal
        {...baseProps}
        hrUsers={[hr]}
        currentAssignee="hrtest1"
        onAssign={onAssign}
      />,
    )

    const assignBtn = screen.getByRole('button', { name: /^Assign$/i })
    expect(assignBtn).not.toBeDisabled()
    await userEvent.click(assignBtn)

    expect(onAssign).toHaveBeenCalledWith('app-001', 'hrtest1')
  })

  it('allows selecting a different HR and calls onAssign with the new selection', async () => {
    const onAssign = vi.fn()
    const hr1 = mockHRUser({ username: 'hr-one', fullName: 'HR One' })
    const hr2 = mockHRUser({ username: 'hr-two', fullName: 'HR Two', userId: 'u2' })
    render(
      <AssignHRModal
        {...baseProps}
        hrUsers={[hr1, hr2]}
        currentAssignee="hr-one"
        onAssign={onAssign}
      />,
    )

    // Select the second HR
    await userEvent.click(screen.getByRole('radio', { name: /HR Two/i }))

    const assignBtn = screen.getByRole('button', { name: /^Assign$/i })
    await userEvent.click(assignBtn)

    expect(onAssign).toHaveBeenCalledWith('app-001', 'hr-two')
  })

  it('calls onClose when "Cancel" button is clicked', async () => {
    const onClose = vi.fn()
    render(<AssignHRModal {...baseProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Assigning…" text when assigning=true', () => {
    const hr = mockHRUser()
    render(<AssignHRModal {...baseProps} assigning={true} hrUsers={[hr]} currentAssignee={hr.username} />)
    expect(screen.getByText('Assigning…')).toBeInTheDocument()
  })

  it('shows "Current" badge next to existing assignee', () => {
    const hr = mockHRUser({ username: 'hrtest1' })
    render(<AssignHRModal {...baseProps} hrUsers={[hr]} currentAssignee="hrtest1" />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('shows HR Manager role label for HR_MANAGER role', () => {
    const hr = mockHRUser({ userRole: 'HR_MANAGER', username: 'hrmgr', fullName: 'HR Manager User' })
    render(<AssignHRModal {...baseProps} hrUsers={[hr]} />)
    expect(screen.getByText(/@hrmgr · HR Manager/)).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<AssignHRModal {...baseProps} error="Assignment failed" />)
    expect(screen.getByText('Assignment failed')).toBeInTheDocument()
  })
})
