import { CandidateHeader } from "@/components/layout/candidate/candidate-header"
import { CandidateFooter } from "@/components/layout/candidate/candidate-footer"

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CandidateHeader />
      <main className="flex-1">{children}</main>
      <CandidateFooter />
    </div>
  )
}
