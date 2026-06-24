"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts"

const DEFAULT_COLORS = [
  "var(--primary)",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

interface StatusPieChartProps {
  data: { name: string; value: number }[]
  title?: string
  colors?: string[]
}

interface TooltipPayload {
  name: string
  value: number
  payload: { name: string; value: number }
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  total: number
}) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground">{name}</p>
      <p className="text-muted-foreground">
        {value.toLocaleString()} · {pct}%
      </p>
    </div>
  )
}

export function StatusPieChart({
  data,
  title,
  colors = DEFAULT_COLORS,
}: StatusPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const nonEmpty = data.filter((d) => d.value > 0)

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={nonEmpty.length ? data : [{ name: "Empty", value: 1 }]}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={nonEmpty.length > 1 ? 2 : 0}
            strokeWidth={0}
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={nonEmpty.length ? colors[idx % colors.length] : "var(--muted)"}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as { cx: number; cy: number }
                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: 22, fontWeight: 700, fill: "currentColor" }}
                    >
                      {total.toLocaleString()}
                    </text>
                    <text
                      x={cx}
                      y={cy + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: 10, fill: "var(--muted-foreground, #6b7280)", letterSpacing: "0.05em" }}
                    >
                      TOTAL
                    </text>
                  </g>
                )
              }}
            />
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-5">
        {data.map((entry, idx) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0"
          return (
            <div key={entry.name} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-xs text-muted-foreground truncate flex-1">{entry.name}</span>
              <span className="text-xs font-medium tabular-nums flex-shrink-0">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
