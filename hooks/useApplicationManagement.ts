"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationService } from "@/lib/application/application-service";
import { ApiError } from "@/lib/api-client";
import type { ApplicationNote, StatusHistoryItem } from "@/types/application";

// ─── Status history ────────────────────────────────────────────────────────

export function useStatusHistory(applicationId: string) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getStatusHistory(applicationId);
      setHistory(res.data ?? []);
    } catch {
      setError("Failed to load status history.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refresh: fetchHistory };
}

// ─── Notes management ──────────────────────────────────────────────────────

export function useApplicationNotes(applicationId: string) {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getApplicationNotes(applicationId);
      setNotes(res.data ?? []);
    } catch {
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(
    async (content: string, candidateVisible: boolean) => {
      setSubmitting(true);
      setError(null);
      try {
        await applicationService.addApplicationNote(
          applicationId,
          content,
          candidateVisible,
        );
        await fetchNotes();
      } catch {
        setError("Failed to add note.");
      } finally {
        setSubmitting(false);
      }
    },
    [applicationId, fetchNotes],
  );

  const editNote = useCallback(
    async (noteId: string, content: string, candidateVisible: boolean) => {
      setSubmitting(true);
      setError(null);
      try {
        await applicationService.updateApplicationNote(
          applicationId,
          noteId,
          content,
          candidateVisible,
        );
        await fetchNotes();
      } catch {
        setError("Failed to update note.");
      } finally {
        setSubmitting(false);
      }
    },
    [applicationId, fetchNotes],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      setError(null);
      try {
        await applicationService.deleteApplicationNote(applicationId, noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch {
        setError("Failed to delete note.");
      }
    },
    [applicationId],
  );

  return {
    notes,
    loading,
    submitting,
    error,
    addNote,
    editNote,
    deleteNote,
    refresh: fetchNotes,
  };
}

// ─── Status update ─────────────────────────────────────────────────────────

export function useStatusUpdate(applicationId: string, onSuccess?: () => void) {
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (status: string) => {
      setUpdating(true);
      setStatusError(null);
      try {
        await applicationService.updateApplicationStatus(applicationId, status);
        onSuccess?.();
      } catch (err) {
        // Surface backend's invalid-transition message if available
        const msg =
          err instanceof ApiError
            ? err.message
            : "Failed to update status.";
        setStatusError(msg);
      } finally {
        setUpdating(false);
      }
    },
    [applicationId, onSuccess],
  );

  return { updateStatus, updating, statusError, clearStatusError: () => setStatusError(null) };
}

// ─── Assign application ────────────────────────────────────────────────────

export function useAssignApplication(onSuccess?: () => void) {
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const assign = useCallback(
    async (applicationId: string, hrUsername: string) => {
      setAssigning(true);
      setAssignError(null);
      try {
        await applicationService.assignApplication(applicationId, hrUsername);
        onSuccess?.();
      } catch {
        setAssignError("Failed to assign application.");
      } finally {
        setAssigning(false);
      }
    },
    [onSuccess],
  );

  return { assign, assigning, assignError, clearAssignError: () => setAssignError(null) };
}
