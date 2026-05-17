/**
 * Integration tests — NotesPanel component
 * NotesPanel is a pure controlled component: it takes notes[], onAdd, onEdit,
 * onDelete as props. We test the rendered UI and callback invocations directly.
 * MSW is running but not exercised here — notes flow through props, not HTTP.
 */
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '../mocks/server'
import { mockApplicationNote } from '../mocks/handlers'
import { NotesPanel } from '@/components/hrm/notes-panel'
import type { ApplicationNote } from '@/types/application'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => { server.resetHandlers(); vi.clearAllMocks() })
afterAll(() => server.close())

/** Render helper with sensible defaults */
function renderNotes(
  props: Partial<React.ComponentProps<typeof NotesPanel>> = {}
) {
  const defaults = {
    notes: [] as ApplicationNote[],
    loading: false,
    submitting: false,
    error: null,
    currentUsername: 'hrtest1',
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }
  return render(<NotesPanel {...defaults} {...props} />)
}

describe('NotesPanel', () => {
  it('shows "No notes yet." when notes array is empty', () => {
    renderNotes({ notes: [] })
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })

  it('renders existing note content and author', () => {
    const note = mockApplicationNote({ content: 'Great candidate!', author: 'hrtest1' })
    renderNotes({ notes: [note] })
    expect(screen.getByText('Great candidate!')).toBeInTheDocument()
    expect(screen.getByText('@hrtest1')).toBeInTheDocument()
  })

  it('shows "Loading notes…" when loading prop is true', () => {
    renderNotes({ loading: true, notes: [] })
    expect(screen.getByText(/loading notes/i)).toBeInTheDocument()
  })

  it('calls onAdd with correct content and visibility flag when Add Note is clicked', async () => {
    const onAdd = vi.fn()
    renderNotes({ onAdd })

    const textarea = screen.getByPlaceholderText(/write a note about this candidate/i)
    await userEvent.type(textarea, 'Strong technical background')

    // Check "Visible to candidate" checkbox
    const visibleCheckbox = screen.getByLabelText(/visible to candidate/i)
    await userEvent.click(visibleCheckbox)

    await userEvent.click(screen.getByRole('button', { name: /add note/i }))

    expect(onAdd).toHaveBeenCalledOnce()
    expect(onAdd).toHaveBeenCalledWith('Strong technical background', true)
  })

  it('does not call onAdd when content is blank (button disabled)', async () => {
    const onAdd = vi.fn()
    renderNotes({ onAdd })

    // Add Note button should be disabled with empty textarea
    const addBtn = screen.getByRole('button', { name: /add note/i })
    expect(addBtn).toBeDisabled()

    await userEvent.click(addBtn)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('calls onDelete with the correct noteId when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const note = mockApplicationNote({ id: 'note-xyz', author: 'hrtest1', content: 'Delete me' })
    renderNotes({ notes: [note], onDelete })

    // Delete button is only shown when note.author === currentUsername
    const deleteBtn = screen.getByTitle('Delete note')
    await userEvent.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith('note-xyz')
  })

  it('edit flow: click edit, update content, click Save → calls onEdit with correct args', async () => {
    const onEdit = vi.fn()
    const note = mockApplicationNote({
      id: 'note-edit-1',
      author: 'hrtest1',
      content: 'Original content',
      candidateVisible: false,
    })
    renderNotes({ notes: [note], onEdit })

    // Click the edit (pencil) button
    await userEvent.click(screen.getByTitle('Edit note'))

    // Edit textarea should appear with original content
    const editArea = screen.getByDisplayValue('Original content')
    await userEvent.clear(editArea)
    await userEvent.type(editArea, 'Updated content')

    // Save
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith('note-edit-1', 'Updated content', false)
  })

  it('cancel edit restores the note display without calling onEdit', async () => {
    const onEdit = vi.fn()
    const note = mockApplicationNote({ id: 'note-cancel', author: 'hrtest1', content: 'Keep me' })
    renderNotes({ notes: [note], onEdit })

    await userEvent.click(screen.getByTitle('Edit note'))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    // onEdit must NOT have been called
    expect(onEdit).not.toHaveBeenCalled()
    // Original content should be visible again
    expect(screen.getByText('Keep me')).toBeInTheDocument()
  })

  it('shows error banner when error prop is set', () => {
    renderNotes({ error: 'Failed to save note.' })
    expect(screen.getByText('Failed to save note.')).toBeInTheDocument()
  })

  it('hides edit/delete buttons for notes authored by a different user', () => {
    const note = mockApplicationNote({ id: 'note-other', author: 'someone-else', content: 'Not mine' })
    // currentUsername is 'hrtest1', note.author is 'someone-else'
    renderNotes({ notes: [note] })

    expect(screen.queryByTitle('Edit note')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete note')).not.toBeInTheDocument()
    expect(screen.getByText('Not mine')).toBeInTheDocument()
  })
})
