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

  it('renders all six statuses when current is APPLIED (nothing precedes it)', () => {
    render(<StatusUpdateModal {...baseProps} />)
    const expectedStatuses = ['APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']
    const radios = screen.getAllByRole('radio')
    const values = radios.map((r) => (r as HTMLInputElement).value)
    for (const status of expectedStatuses) {
      expect(values).toContain(status)
    }
  })

  it('hides statuses before the current one (forward-only flow)', () => {
    render(<StatusUpdateModal {...baseProps} currentStatus="INTERVIEW" />)
    const radios = screen.getAllByRole('radio')
    const values = radios.map((r) => (r as HTMLInputElement).value)
    expect(values).not.toContain('APPLIED')
    expect(values).not.toContain('REVIEWING')
    expect(values).toEqual(['INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'])
  })

  it('shows only the current status when HIRED (terminal, cannot revert or reject)', () => {
    render(<StatusUpdateModal {...baseProps} currentStatus="HIRED" />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(1)
    expect((radios[0] as HTMLInputElement).value).toBe('HIRED')
  })

  it('shows only the current status when REJECTED (terminal)', () => {
    render(<StatusUpdateModal {...baseProps} currentStatus="REJECTED" />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(1)
    expect((radios[0] as HTMLInputElement).value).toBe('REJECTED')
  })

  it('re-syncs the selection when reopened with a different current status', () => {
    const { rerender } = render(<StatusUpdateModal {...baseProps} currentStatus="APPLIED" isOpen={false} />)
    rerender(<StatusUpdateModal {...baseProps} currentStatus="REVIEWING" isOpen={true} />)
    const updateBtn = screen.getByRole('button', { name: /Update Status/i })
    // selected should match the new currentStatus, so the button stays disabled until a change is made
    expect(updateBtn).toBeDisabled()
  })
})
