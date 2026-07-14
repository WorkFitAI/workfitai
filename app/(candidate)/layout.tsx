import { CandidateHeader } from "@/components/layout/candidate/candidate-header"
import { CandidateFooter } from "@/components/layout/candidate/candidate-footer"
import JobPreferencesOnboarding from "@/components/jobs/preferences/job-preferences-onboarding"

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CandidateHeader />
      <main className="flex-1 pt-16">{children}</main>
      <CandidateFooter />
      {/* First-run job-preferences onboarding — triggers on the first visit to
          any candidate page, gated on localStorage + role inside the component. */}
      <JobPreferencesOnboarding />
    </div>
  )
}
