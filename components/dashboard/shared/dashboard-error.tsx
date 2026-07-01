import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardErrorProps {
  message: string
  onRetry?: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
