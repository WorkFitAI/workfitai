import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionFallbackProps {
  title: string
  className?: string
}

export function SectionFallback({ title, className }: SectionFallbackProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-center gap-3 p-4">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-medium">{title} unavailable</p>
          <p className="text-xs text-muted-foreground">Service temporarily unreachable.</p>
        </div>
      </CardContent>
    </Card>
  )
}
