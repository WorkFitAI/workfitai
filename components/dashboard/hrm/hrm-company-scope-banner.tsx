import { Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function HrmCompanyScopeBanner() {
  const { user } = useAuth()
  const companyIdentifier = user?.companyId ?? "Your Company"

  return (
    <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700">
      <Building2 className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>{companyIdentifier}</strong> — Company-scoped dashboard.
        Data is restricted to your organization.
      </span>
    </div>
  )
}
