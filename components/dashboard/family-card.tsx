"use client"

import { Plus } from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-context"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function FamilyCard() {
  const { availableBudget, averageDailyThisWeek, setAddSheetOpen } = useDashboard()

  return (
    <div className="group relative flex h-full w-full min-w-0 flex-col justify-center gap-1 rounded-[32px] bg-g-green px-4 py-4 md:rounded-[56px] md:px-14">
      <div className="flex w-full min-w-0 items-center gap-2">
        <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text md:text-[20px] md:font-semibold md:leading-[1.4em]">
          Família
        </span>
      </div>
      <span
        className="budget-value-mobile w-full min-w-0 break-words text-g-green-dark"
      >
        R$ {formatCurrency(availableBudget.geral)}
      </span>
      <span className="text-[12px] font-normal leading-[1.33em] text-g-green-accent md:text-[20px] md:leading-[1.4em]">
        Média R$ {formatCurrency(averageDailyThisWeek.geral)}/dia
      </span>
      <button
        type="button"
        onClick={() => setAddSheetOpen(true)}
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        aria-label="Adicionar gasto"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-g-green-dark text-white shadow-md transition-transform hover:scale-105 active:scale-95">
          <Plus className="size-6" strokeWidth={2.5} />
        </span>
        <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text/90">
          Adicionar Gasto
        </span>
      </button>
    </div>
  )
}
