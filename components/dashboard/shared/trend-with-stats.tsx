"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { VolumeTrendPoint } from "@/types/dashboard"

interface TrendStats {
  last7Days: number
  last30Days: number
  monthOverMonth: number // 0.12 = +12%
  yearOverYear: number   // 0.45 = +45%
}

interface TrendWithStatsProps {
  data: VolumeTrendPoint[]
  title: string
  stats: TrendStats
  color?: string
  height?: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function pctColor(v: number) {
  return v >= 0 ? "text-green-600" : "text-red-500"
}

function pctLabel(v: number) {
  return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`
}

export function TrendWithStats({
  data,
  title,
  stats,
  color = "#7c5cbf",
  height = 160,
}: TrendWithStatsProps) {
  const gradientId = `twg-${color.replace("#", "")}`
  const interval = data.length > 14 ? Math.floor(data.length / 7) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length < 3 ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height }}
          >
            Not enough data to display a trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={interval}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value) => [value ?? 0, "Applications"]}
                labelFormatter={(label) => formatDate(String(label))}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 4-pill stat row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last 7d</p>
            <p className="text-sm font-bold">{stats.last7Days.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last 30d</p>
            <p className="text-sm font-bold">{stats.last30Days.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">MoM</p>
            <p className={cn("text-sm font-bold", pctColor(stats.monthOverMonth))}>
              {pctLabel(stats.monthOverMonth)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">YoY</p>
            <p className={cn("text-sm font-bold", pctColor(stats.yearOverYear))}>
              {pctLabel(stats.yearOverYear)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
