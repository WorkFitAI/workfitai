"use client";

import { useEffect, useState } from "react";
import {
  ApplicationDetail,
  StatusHistoryItem,
  CandidateNote,
} from "@/types/application";
import { applicationService } from "@/lib/application/application-service";

export const useApplicationDetail = (applicationId: string) => {
  const [application, setApplication] = useState<ApplicationDetail | null>(
    null
  );
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel-fetch all three endpoints
        const [detailRes, historyRes, notesRes] = await Promise.all([
          applicationService.getApplicationById(applicationId),
          applicationService.getStatusHistory(applicationId),
          applicationService.getVisibleNotes(applicationId),
        ]);

        setApplication(detailRes.data);
        setStatusHistory(historyRes.data.statusHistory);
        setNotes(notesRes.data.notes);
      } catch (err) {
        console.error("Fetch application detail error:", err);
        setError("Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [applicationId]);

  return { application, statusHistory, notes, loading, error };
};
