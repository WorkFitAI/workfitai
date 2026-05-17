/**
 * Unit tests — NotesPanel component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesPanel } from '@/components/hrm/notes-panel'
import { mockApplicationNote } from '../../../mocks/handlers'

const baseProps = {
  notes: [],
  loading: false,
  submitting: false,
  currentUsername: 'hrtest1',
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotesPanel', () => {
  it('shows "No notes yet." when notes array is empty and not loading', () => {
    render(<NotesPanel {...baseProps} />)
    expect(screen.getByText('No notes yet.')).toBeInTheDocument()
  })

  it('shows "Loading notes…" when loading=true', () => {
    render(<NotesPanel {...baseProps} loading={true} />)
    expect(screen.getByText('Loading notes…')).toBeInTheDocument()
  })

  it('renders note content and @author for each note', () => {
    const note = mockApplicationNote({ content: 'Great candidate!', author: 'hrtest1' })
    render(<NotesPanel {...baseProps} notes={[note]} />)
    expect(screen.getByText('Great candidate!')).toBeInTheDocument()
    expect(screen.getByText('@hrtest1')).toBeInTheDocument()
  })

  it('shows "Visible to candidate" badge on notes with candidateVisible=true', () => {
    const note = mockApplicationNote({ candidateVisible: true })
    render(<NotesPanel {...baseProps} notes={[note]} />)
    // Two occurrences: Add Note form checkbox label + the note-level badge span
    const badges = screen.getAllByText('Visible to candidate')
    expect(badges).toHaveLength(2)
  })

  it('does not show "Visible to candidate" badge on candidateVisible=false notes', () => {
    const note = mockApplicationNote({ candidateVisible: false })
    render(<NotesPanel {...baseProps} notes={[note]} />)
    // The label in the Add Note form also says "Visible to candidate" — so we need to
    // verify the *note-level* badge is absent while the checkbox label still shows
    const badges = screen.queryAllByText('Visible to candidate')
    // Only the Add Note form checkbox label exists — no note badge
    // The checkbox label is a <label> element, the badge is a <span>; both share the text
    // Ensure only 1 occurrence (the checkbox label in Add Note form)
    expect(badges).toHaveLength(1)
  })

  it('shows edit and delete buttons only for notes owned by currentUsername', () => {
    const ownNote = mockApplicationNote({ id: 'note-001', author: 'hrtest1' })
    const otherNote = mockApplicationNote({ id: 'note-002', author: 'otherhr' })
    render(<NotesPanel {...baseProps} notes={[ownNote, otherNote]} />)

    // Edit and delete buttons are rendered via title attributes
    const editBtns = screen.getAllByTitle('Edit note')
    const deleteBtns = screen.getAllByTitle('Delete note')
    expect(editBtns).toHaveLength(1)
    expect(deleteBtns).toHaveLength(1)
  })

  it('does not show edit/delete buttons for notes by other users', () => {
    const otherNote = mockApplicationNote({ id: 'note-002', author: 'someoneelse' })
    render(<NotesPanel {...baseProps} notes={[otherNote]} />)
    expect(screen.queryByTitle('Edit note')).toBeNull()
    expect(screen.queryByTitle('Delete note')).toBeNull()
  })

  it('calls onAdd with content and candidateVisible=false when "Add Note" is clicked', async () => {
    const onAdd = vi.fn()
    render(<NotesPanel {...baseProps} onAdd={onAdd} />)

    const textarea = screen.getByPlaceholderText(/Write a note about this candidate/i)
    await userEvent.type(textarea, 'Candidate is promising')
    await userEvent.click(screen.getByRole('button', { name: /Add Note/i }))

    expect(onAdd).toHaveBeenCalledWith('Candidate is promising', false)
  })

  it('calls onAdd with candidateVisible=true when checkbox is checked', async () => {
    const onAdd = vi.fn()
    render(<NotesPanel {...baseProps} onAdd={onAdd} />)

    const textarea = screen.getByPlaceholderText(/Write a note about this candidate/i)
    await userEvent.type(textarea, 'Visible note')

    // The checkbox label text is "Visible to candidate" — click the checkbox
    const checkbox = screen.getByRole('checkbox', { name: /Visible to candidate/i })
    await userEvent.click(checkbox)

    await userEvent.click(screen.getByRole('button', { name: /Add Note/i }))
    expect(onAdd).toHaveBeenCalledWith('Visible note', true)
  })

  it('clicking the edit button shows a textarea pre-filled with note content', async () => {
    const note = mockApplicationNote({ id: 'note-001', author: 'hrtest1', content: 'Original content' })
    render(<NotesPanel {...baseProps} notes={[note]} />)

    await userEvent.click(screen.getByTitle('Edit note'))

    // Should find a textarea with the note content pre-filled
    const editTextarea = screen.getByDisplayValue('Original content')
    expect(editTextarea).toBeInTheDocument()
  })

  it('calls onEdit with noteId, new content, and candidateVisible when Save is clicked', async () => {
    const onEdit = vi.fn()
    const note = mockApplicationNote({ id: 'note-001', author: 'hrtest1', content: 'Original' })
    render(<NotesPanel {...baseProps} notes={[note]} onEdit={onEdit} />)

    await userEvent.click(screen.getByTitle('Edit note'))

    const editTextarea = screen.getByDisplayValue('Original')
    await userEvent.clear(editTextarea)
    await userEvent.type(editTextarea, 'Updated content')

    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(onEdit).toHaveBeenCalledWith('note-001', 'Updated content', false)
  })

  it('calls onDelete with noteId when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const note = mockApplicationNote({ id: 'note-001', author: 'hrtest1' })
    render(<NotesPanel {...baseProps} notes={[note]} onDelete={onDelete} />)

    await userEvent.click(screen.getByTitle('Delete note'))
    expect(onDelete).toHaveBeenCalledWith('note-001')
  })

  it('shows error message when error prop is provided', () => {
    render(<NotesPanel {...baseProps} error="Failed to save note" />)
    expect(screen.getByText('Failed to save note')).toBeInTheDocument()
  })
})
