"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useDashboard } from "@/components/dashboard/dashboard-context"

const COLORS = ["#A8E766", "#327F39", "#53950D", "#88DB31", "#C7FF8D", "#5DA413", "#133A18"]

export function ExpensesDonutChart() {
  const { expenses } = useDashboard()

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.value
    return acc
  }, {})

  const data = Object.entries(byCategory).map(([name, value], i) => ({
    name,
    value: Math.round(value * 100) / 100,
    fill: COLORS[i % COLORS.length],
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-3xl bg-g-white text-[16px] text-g-muted">
        Nenhum dado para exibir
      </div>
    )
  }

  return (
    <div className="h-full min-h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #F4F5F2",
              borderRadius: "8px",
            }}
            formatter={(value: number | undefined) =>
              (value ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
              })
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
