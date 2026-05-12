"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ApplicationNote } from "@/types/application";

interface NotesPanelProps {
  notes: ApplicationNote[];
  loading: boolean;
  submitting: boolean;
  error?: string | null;
  currentUsername: string;
  onAdd: (content: string, candidateVisible: boolean) => void;
  onEdit: (noteId: string, content: string, candidateVisible: boolean) => void;
  onDelete: (noteId: string) => void;
}

export function NotesPanel({
  notes,
  loading,
  submitting,
  error,
  currentUsername,
  onAdd,
  onEdit,
  onDelete,
}: NotesPanelProps) {
  const [newContent, setNewContent] = useState("");
  const [newVisible, setNewVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editVisible, setEditVisible] = useState(false);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    onAdd(newContent.trim(), newVisible);
    setNewContent("");
    setNewVisible(false);
  };

  const startEdit = (note: ApplicationNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditVisible(note.candidateVisible);
  };

  const handleEdit = () => {
    if (!editingId || !editContent.trim()) return;
    onEdit(editingId, editContent.trim(), editVisible);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add new note */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Note</h4>
        <textarea
          id="new-note-content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a note about this candidate…"
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="new-note-visible"
              checked={newVisible}
              onChange={(e) => setNewVisible(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Visible to candidate
          </label>
          <button
            onClick={handleAdd}
            disabled={!newContent.trim() || submitting}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="text-sm text-gray-400 py-4 text-center">Loading notes…</div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                note.candidateVisible
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200 bg-white",
              )}
            >
              {editingId === note.id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editVisible}
                        onChange={(e) => setEditVisible(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Visible to candidate
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEdit}
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    {note.author === currentUsername && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(note)}
                          className="rounded p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit note"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(note.id)}
                          className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete note"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>@{note.author}</span>
                    <span>·</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                    {note.updatedAt && (
                      <>
                        <span>·</span>
                        <span className="italic">edited</span>
                      </>
                    )}
                    {note.candidateVisible && (
                      <span className="ml-auto text-emerald-600 font-medium">Visible to candidate</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
