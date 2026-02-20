// Auth route group layout — includes site header with decorative illustration support
import { CandidateHeader } from "@/components/layout/candidate/candidate-header"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <CandidateHeader />
      <main className="relative overflow-hidden">
        {children}
      </main>
    </div>
  )
}
