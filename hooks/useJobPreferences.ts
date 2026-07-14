"use client";

import { useCallback, useEffect, useState } from "react";

import { JobPreferences } from "@/types/job-preferences";
import {
  dismissPreferences,
  getDeclaredPreferences,
  hasResponded as checkHasResponded,
  savePreferences,
} from "@/lib/job/job-preferences-storage";

export const useJobPreferences = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [declaredPrefs, setDeclaredPrefs] = useState<JobPreferences | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // One-time client-only read of localStorage (an external, non-reactive
    // store) deferred to after mount so SSR/hydration output stays stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasResponded(checkHasResponded());
    setDeclaredPrefs(getDeclaredPreferences());
    setIsReady(true);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const save = useCallback((prefs: JobPreferences) => {
    savePreferences(prefs);
    setDeclaredPrefs(prefs);
    setHasResponded(true);
    setIsModalOpen(false);
  }, []);

  const dismiss = useCallback(() => {
    dismissPreferences();
    setDeclaredPrefs(null);
    setHasResponded(true);
    setIsModalOpen(false);
  }, []);

  return {
    isReady,
    hasResponded,
    declaredPrefs,
    isModalOpen,
    openModal,
    closeModal,
    save,
    dismiss,
  };
};
