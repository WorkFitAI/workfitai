"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopHorizontalBarChartProps {
  data: { name: string; value: number }[]
  title?: string
  color?: string
  maxItems?: number
  valueLabel?: string
}

function truncate(str: string, max = 24) {
  return str.length > max ? str.slice(0, max) + "…" : str
}

export function TopHorizontalBarChart({
  data,
  title,
  color = "var(--primary)",
  maxItems = 5,
  valueLabel = "count",
}: TopHorizontalBarChartProps) {
  const sliced = data.slice(0, maxItems)
  const max = Math.max(...sliced.map((d) => d.value), 1)

  return (
    <Card className="gap-1">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-3"}>
        {sliced.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No data.</p>
        ) : (
          <div className="space-y-2.5">
            {sliced.map((item, idx) => {
              const pct = Math.max((item.value / max) * 100, 2)
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <span className="w-3.5 text-[10px] font-semibold text-muted-foreground/60 tabular-nums text-right flex-shrink-0 leading-none">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground truncate leading-none">
                        {truncate(item.name)}
                      </span>
                      <span className="text-xs font-semibold tabular-nums flex-shrink-0 leading-none">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color, opacity: 1 - idx * 0.12 }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
