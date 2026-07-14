"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { useJobPreferences } from "@/hooks/useJobPreferences";
import { applyPreferencesToParams } from "@/lib/job/job-preferences-to-params";
import { JobPreferences } from "@/types/job-preferences";

import JobPreferencesModal from "@/components/jobs/preferences/job-preferences-modal";

const HR_ROLES = ["ROLE_ADMIN", "ROLE_HR", "ROLE_HR_MANAGER"];

/**
 * Global first-run onboarding gate for the candidate-facing site.
 *
 * Mounted once in the candidate layout so it triggers on the *first* visit to
 * any public page (home, jobs, companies…), not just `/jobs`. Shows the
 * multi-step preferences wizard when the visitor is a guest or candidate who
 * has never responded (nothing in localStorage) and is not an HR/Admin user.
 *
 * On finish it saves to localStorage and routes to `/jobs` with the preferences
 * applied as filters, delivering an immediate payoff to the completed flow.
 */
export default function JobPreferencesOnboarding() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isReady, hasResponded, isModalOpen, openModal, save, dismiss } =
    useJobPreferences();

  const isHrOrAdmin =
    isAuthenticated && (user?.roles ?? []).some((role) => HR_ROLES.includes(role));

  // Prompt guests/candidates who have never responded, once auth has resolved
  // (so we know the role) and localStorage has been read (no hydration flash).
  useEffect(() => {
    if (!isReady || authLoading || hasResponded || isHrOrAdmin) return;
    openModal();
  }, [isReady, authLoading, hasResponded, isHrOrAdmin, openModal]);

  const handleSave = (prefs: JobPreferences) => {
    save(prefs);

    const params = applyPreferencesToParams(prefs);
    router.push(`/jobs?${params.toString()}`);

    toast.success("Preferences saved! Here are jobs matched to you.");
  };

  return (
    <JobPreferencesModal
      open={isModalOpen}
      onSave={handleSave}
      onClose={dismiss}
    />
  );
}
