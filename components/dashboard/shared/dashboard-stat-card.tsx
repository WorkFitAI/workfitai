import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  subtitle?: React.ReactNode
  variant?: "default" | "warning" | "danger"
  size?: "sm" | "default"
}

const ICON_STYLE: Record<string, string> = {
  default: "bg-indigo-50 text-indigo-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
}

const BORDER_STYLE: Record<string, string> = {
  default: "",
  warning: "border-l-[3px] border-l-amber-400",
  danger: "border-l-[3px] border-l-red-500",
}

export function DashboardStatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = "default",
  size = "default",
}: DashboardStatCardProps) {
  return (
    <Card className={cn("overflow-hidden", BORDER_STYLE[variant])}>
      <CardContent className={size === "sm" ? "px-4" : "px-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className={cn("font-semibold uppercase tracking-widest text-muted-foreground", size === "sm" ? "text-[10px]" : "text-[11px]")}>
              {title}
            </p>
            <p className={cn("font-bold tracking-tight", size === "sm" ? "text-2xl" : "text-3xl")}>{value}</p>
            {subtitle && <div className="pt-0.5">{subtitle}</div>}
            {trend && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-1.5 text-xs gap-1 inline-flex",
                  trend.value >= 0
                    ? "text-green-700 border-green-200 bg-green-50"
                    : "text-red-600 border-red-200 bg-red-50"
                )}
              >
                {trend.value >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value > 0 ? "+" : ""}
                {trend.value.toFixed(1)}% {trend.label}
              </Badge>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex-shrink-0 rounded-xl p-2.5",
                ICON_STYLE[variant]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
