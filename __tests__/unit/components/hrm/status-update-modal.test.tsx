/**
 * Unit tests — StatusUpdateModal component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatusUpdateModal } from '@/components/hrm/status-update-modal'

const baseProps = {
  isOpen: true,
  currentStatus: 'APPLIED' as const,
  updating: false,
  onUpdate: vi.fn(),
  onClose: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('StatusUpdateModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<StatusUpdateModal {...baseProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Update Application Status" heading when open', () => {
    render(<StatusUpdateModal {...baseProps} />)
    expect(screen.getByText('Update Application Status')).toBeInTheDocument()
  })

  it('shows current status label with correct text', () => {
    render(<StatusUpdateModal {...baseProps} />)
    expect(screen.getByText(/Current status:/i)).toBeInTheDocument()
    // "Applied" appears as the status label — use getByRole to target the span text
    const appliedLabel = screen.getAllByText('Applied')
    expect(appliedLabel.length).toBeGreaterThan(0)
  })

  it('disables the radio for currentStatus (APPLIED)', () => {
    render(<StatusUpdateModal {...baseProps} />)
    // The radio with value "APPLIED" is disabled since it is the current status
    const radios = screen.getAllByRole('radio')
    const appliedRadio = radios.find((r) => (r as HTMLInputElement).value === 'APPLIED')
    expect(appliedRadio).toBeDefined()
    expect(appliedRadio).toBeDisabled()
  })

  it('other status radios are not disabled', () => {
    render(<StatusUpdateModal {...baseProps} />)
    const reviewingRadio = screen.getAllByRole('radio').find(
      (r) => (r as HTMLInputElement).value === 'REVIEWING',
    )
    expect(reviewingRadio).not.toBeDisabled()
  })

  it('calls onUpdate with selected status when "Update Status" is clicked', async () => {
    const onUpdate = vi.fn()
    render(<StatusUpdateModal {...baseProps} onUpdate={onUpdate} />)
    // Select REVIEWING
    const reviewingRadio = screen.getAllByRole('radio').find(
      (r) => (r as HTMLInputElement).value === 'REVIEWING',
    ) as HTMLElement
    await userEvent.click(reviewingRadio)
    await userEvent.click(screen.getByRole('button', { name: /Update Status/i }))
    expect(onUpdate).toHaveBeenCalledWith('REVIEWING')
  })

  it('does not call onUpdate when clicking "Update Status" without changing status', async () => {
    const onUpdate = vi.fn()
    render(<StatusUpdateModal {...baseProps} onUpdate={onUpdate} />)
    // The button is disabled when selected === currentStatus (initial state)
    const updateBtn = screen.getByRole('button', { name: /Update Status/i })
    expect(updateBtn).toBeDisabled()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('calls onClose when "Cancel" button is clicked', async () => {
    const onClose = vi.fn()
    render(<StatusUpdateModal {...baseProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Updating…" text and disables the update button when updating=true', () => {
    render(<StatusUpdateModal {...baseProps} updating={true} />)
    const btn = screen.getByRole('button', { name: /Updating…/i })
    expect(btn).toBeDisabled()
  })

  it('displays error message when error prop is provided', () => {
    render(<StatusUpdateModal {...baseProps} error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders all six statuses from STATUS_FLOW as radio options', () => {
    render(<StatusUpdateModal {...baseProps} />)
    const expectedStatuses = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']
    const radios = screen.getAllByRole('radio')
    const values = radios.map((r) => (r as HTMLInputElement).value)
    for (const status of expectedStatuses) {
      expect(values).toContain(status)
    }
  })
})
