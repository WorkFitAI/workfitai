"use client";

import { useEffect, useState } from "react";
import { ApplicationDetail, StatusHistoryItem } from "@/types/application";
import { applicationService } from "@/lib/application/application-service";

export const useApplicationDetail = (applicationId: string) => {
  const [application, setApplication] = useState<ApplicationDetail | null>(
    null
  );
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch detail and history in parallel.
        // NOTE: There is no /notes endpoint — do NOT add it here.
        const [detailRes, historyRes] = await Promise.all([
          applicationService.getApplicationById(applicationId),
          applicationService.getStatusHistory(applicationId),
        ]);

        setApplication(detailRes.data);
        // Backend returns data as a plain StatusHistoryItem[] array (not wrapped)
        setStatusHistory(historyRes.data ?? []);
      } catch (err) {
        console.error("Fetch application detail error:", err);
        setError("Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [applicationId]);

  return { application, statusHistory, loading, error };
};
