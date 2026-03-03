"use client"

import { Plus } from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-context"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function PersonCard({
  name,
  available,
  dailyAvg,
  variant,
  onAddExpense,
}: {
  name: string
  available: number
  dailyAvg: number
  variant: "dark" | "light"
  onAddExpense: () => void
}) {
  const isDark = variant === "dark"

  return (
    <div
      className="group relative flex min-w-0 flex-1 flex-col justify-center gap-1 rounded-[24px] px-4 py-4 md:h-full md:px-10"
      style={{ backgroundColor: isDark ? "#327F39" : "#EDF0E7" }}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <span
          className="text-[16px] font-medium leading-[1.25em]"
          style={{ color: isDark ? "#FFFFFF" : "#133A18" }}
        >
          {name}
        </span>
      </div>
      <span
        className="budget-value-person w-full min-w-0 break-words"
        style={{ color: isDark ? "#FFFFFF" : "#133A18" }}
      >
        R$ {formatCurrency(available)}
      </span>
      <span
        className="text-[12px] font-normal leading-[1.33em]"
        style={{ color: isDark ? "#C7FF8D" : "#53950D" }}
      >
        Média R$ {formatCurrency(dailyAvg)}/dia
      </span>
      <button
        type="button"
        onClick={onAddExpense}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        aria-label="Adicionar gasto"
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${isDark ? "bg-white/20" : "bg-g-green-dark"}`}
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </span>
        <span
          className="text-[16px] font-medium leading-[1.25em]"
          style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(19,58,24,0.9)" }}
        >
          Adicionar Gasto
        </span>
      </button>
    </div>
  )
}

export function PersonCards() {
  const { members, availableBudget, averageDailyThisWeek, setAddSheetOpen } = useDashboard()

  return (
    <div className="flex min-h-0 flex-1 flex-row gap-4">
      {members.map((name, i) => (
        <div key={name} className="flex min-h-0 min-w-0 flex-1 flex-col [container-type:inline-size]">
          <PersonCard
            name={name}
            available={availableBudget[name] ?? 0}
            dailyAvg={averageDailyThisWeek[name] ?? 0}
            variant={i === 0 ? "dark" : "light"}
            onAddExpense={() => setAddSheetOpen(true)}
          />
        </div>
      ))}
    </div>
  )
}
