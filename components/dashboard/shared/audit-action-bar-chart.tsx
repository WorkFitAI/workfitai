"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ACTION_LABELS: Record<string, string> = {
  AUTH_LOGIN_SUCCESS: "Login",
  AUTH_LOGIN_FAILED: "Login Failed",
  AUTH_LOGOUT: "Logout",
  AUTH_REGISTER: "Register",
  AUTH_OTP_VERIFIED: "OTP Verified",
  AUTH_TOKEN_REFRESHED: "Token Refresh",
  USER_APPROVED: "User Approved",
  APPLICATION_SUBMITTED: "App Submitted",
  APPLICATION_STATUS_CHANGED: "Status Changed",
}

function prettifyAction(key: string): string {
  return (
    ACTION_LABELS[key] ??
    key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

interface AuditActionBarChartProps {
  data: Record<string, number>
  title?: string
  maxItems?: number
  color?: string
  hideCard?: boolean
}

export function AuditActionBarChart({
  data,
  title,
  maxItems = 8,
  color = "var(--primary)",
  hideCard = false,
}: AuditActionBarChartProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems)
    .map(([key, value]) => ({ name: prettifyAction(key), value }))

  if (chartData.length === 0) {
    const emptyContent = (
      <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
    )
    if (hideCard) {
      return (
        <div>
          {title && (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {title}
            </p>
          )}
          {emptyContent}
        </div>
      )
    }
    return (
      <Card>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={title ? "pt-0" : "pt-4"}>{emptyContent}</CardContent>
      </Card>
    )
  }

  const chart = (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ bottom: 48, top: 8, left: 0, right: 8 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, angle: -35, textAnchor: "end" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          height={56}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  if (hideCard) {
    return (
      <div>
        {title && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {title}
          </p>
        )}
        {chart}
      </div>
    )
  }

  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-4"}>{chart}</CardContent>
    </Card>
  )
}
