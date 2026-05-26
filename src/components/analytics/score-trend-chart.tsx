"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts"

interface DataPoint { date: string; score: number }

interface Props {
  data:      DataPoint[]
  cutoff?:   number       // show a dashed cutoff reference line
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1">{formatDate(label)}</p>
      <p className="font-semibold text-foreground tabular-nums">
        {payload[0].value.toFixed(1)} / 100
      </p>
    </div>
  )
}

export function ScoreTrendChart({ data, cutoff = 68 }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
      No mock attempts yet. Log your first mock to see the trend.
    </div>
  )

  // Sort oldest → newest for the chart
  const sorted = [...data].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sorted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={cutoff}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `Cutoff ${cutoff}`, position: "right",
                   fontSize: 10, fill: "#f59e0b" }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}