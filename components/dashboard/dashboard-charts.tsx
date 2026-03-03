"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { Responsible } from "@/lib/dashboard-types"

export type DashboardResponsibleFilter = "Família" | Responsible

/* Escala de verde do sistema */
const GREEN = {
  primary: "#A8E766",
  dark: "#327F39",
  accent: "#53950D",
  border: "#88DB31",
  light: "#C7FF8D",
  sub: "#5DA413",
  text: "#133A18",
  muted: "#C8CEBB",
}

function getMonthRange(monthStr: string): { start: Date; end: Date } {
  const [y, m] = monthStr.split("-").map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59)
  return { start, end }
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export function DashboardCharts() {
  const { expenses, members } = useDashboard()
  const [responsibleFilter, setResponsibleFilter] = useState<DashboardResponsibleFilter>("Família")

  const responsibleFilters: { value: DashboardResponsibleFilter; label: string }[] = [
    { value: "Família", label: "Família" },
    ...members.map((m) => ({ value: m as DashboardResponsibleFilter, label: m })),
  ]
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const { start, end } = useMemo(() => getMonthRange(month), [month])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date + "T12:00:00")
      if (d < start || d > end) return false
      if (responsibleFilter === "família") return true
      return e.responsible === responsibleFilter
    })
  }, [expenses, start, end, responsibleFilter])

  const barData = useMemo(() => {
    const byDate: Record<string, number> = {}
    filteredExpenses.forEach((e) => {
      byDate[e.date] = (byDate[e.date] ?? 0) + 1
    })
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
    return sorted.map(([date, count]) => ({
      date,
      label: formatShortDate(date),
      quantidade: count,
    }))
  }, [filteredExpenses])

  const lineData = useMemo(() => {
    const byDate: Record<string, number> = {}
    filteredExpenses.forEach((e) => {
      byDate[e.date] = (byDate[e.date] ?? 0) + e.value
    })
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
    return sorted.map(([date, total]) => ({
      date,
      label: formatShortDate(date),
      valor: Math.round(total * 100) / 100,
    }))
  }, [filteredExpenses])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto">
      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-g-bg px-2 py-1.5 md:gap-2 md:px-3 md:py-2">
          {responsibleFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setResponsibleFilter(f.value)}
              className={`whitespace-nowrap rounded-xl px-2 py-1 text-[13px] font-medium transition-colors md:px-3 md:py-1.5 md:text-[14px] ${
                responsibleFilter === f.value
                  ? "bg-white text-g-green-text shadow-sm"
                  : "text-g-muted hover:text-g-green-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-month" className="text-[13px] font-medium text-g-green-text md:text-[14px]">
            Período
          </label>
          <input
            id="dashboard-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-g-divider bg-g-white px-2 py-1.5 text-[13px] text-g-green-text outline-none focus:ring-2 focus:ring-g-green-border md:px-3 md:py-2 md:text-[14px]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          {/* Gráfico de barras: quantidade de gastos por data */}
          <div className="rounded-3xl bg-g-white p-4">
            <h3 className="mb-4 text-[16px] font-semibold text-g-green-text">
              Gastos por data
            </h3>
            <div className="h-[200px] w-full md:h-[260px]">
              {barData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[14px] text-g-muted">
                  Nenhum gasto no período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GREEN.muted} opacity={0.4} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: GREEN.text }}
                      axisLine={{ stroke: GREEN.muted }}
                      tickLine={{ stroke: GREEN.muted }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: GREEN.text }}
                      axisLine={{ stroke: GREEN.muted }}
                      tickLine={{ stroke: GREEN.muted }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: `1px solid ${GREEN.muted}`,
                        borderRadius: "12px",
                        fontSize: "14px",
                      }}
                      labelStyle={{ color: GREEN.text }}
                      formatter={(value: number | undefined) => [`${value ?? 0} gasto(s)`, "Quantidade"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar
                      dataKey="quantidade"
                      fill={GREEN.primary}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico de linha: valor total por data */}
          <div className="rounded-3xl bg-g-white p-4">
            <h3 className="mb-4 text-[16px] font-semibold text-g-green-text">
              Valor gasto por data
            </h3>
            <div className="h-[200px] w-full md:h-[260px]">
              {lineData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[14px] text-g-muted">
                  Nenhum gasto no período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GREEN.muted} opacity={0.4} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: GREEN.text }}
                      axisLine={{ stroke: GREEN.muted }}
                      tickLine={{ stroke: GREEN.muted }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: GREEN.text }}
                      axisLine={{ stroke: GREEN.muted }}
                      tickLine={{ stroke: GREEN.muted }}
                      tickFormatter={(v) => `R$ ${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: `1px solid ${GREEN.muted}`,
                        borderRadius: "12px",
                        fontSize: "14px",
                      }}
                      labelStyle={{ color: GREEN.text }}
                      formatter={(value: number | undefined) => [
                        (value ?? 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                        }),
                        "Total",
                      ]}
                      labelFormatter={(label) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke={GREEN.dark}
                      strokeWidth={2}
                      dot={{ fill: GREEN.dark, strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: GREEN.accent, stroke: GREEN.text, strokeWidth: 1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de barras por categoria */}
        <div className="mt-4 rounded-3xl bg-g-white p-4 md:mt-0 md:h-full md:min-w-[280px] md:max-w-xs">
          <h3 className="mb-4 text-[16px] font-semibold text-g-green-text">
            Gastos por categoria
          </h3>
          <div className="h-[260px] w-full md:h-full">
            {/* Dados de categoria serão derivados em tempo real */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(() => {
                  const byCategory: Record<string, number> = {}
                  filteredExpenses.forEach((e) => {
                    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.value
                  })
                  return Object.entries(byCategory)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, total]) => ({
                      category,
                      valor: Math.round((total as number) * 100) / 100,
                    }))
                })()}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GREEN.muted} opacity={0.4} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: GREEN.text }}
                  axisLine={{ stroke: GREEN.muted }}
                  tickLine={{ stroke: GREEN.muted }}
                  tickFormatter={(v) =>
                    `R$ ${Number(v).toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={90}
                  tick={{ fontSize: 12, fill: GREEN.text }}
                  axisLine={{ stroke: GREEN.muted }}
                  tickLine={{ stroke: GREEN.muted }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: `1px solid ${GREEN.muted}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                  labelStyle={{ color: GREEN.text }}
                  formatter={(value: number | undefined) => [
                    (value ?? 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                    "Total",
                  ]}
                />
                <Bar
                  dataKey="valor"
                  fill={GREEN.primary}
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
