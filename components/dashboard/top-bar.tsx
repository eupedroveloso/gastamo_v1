"use client"

import { useRef } from "react"
import Image from "next/image"
import type { ExpenseType } from "@/lib/dashboard-types"
import { ViewToggle, type ViewMode } from "@/components/dashboard/view-toggle"

type TypeFilter = ExpenseType | "todos"

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "avulso", label: "Diário" },
  { value: "fixo", label: "Fixo" },
  { value: "parcelado", label: "Parcelado" },
]

export function TopBar({
  view,
  onViewChange,
  typeFilter,
  onTypeFilterChange,
  onAddClick,
  userName,
  searchQuery,
  onSearchQueryChange,
  month,
  onMonthChange,
}: {
  view: ViewMode
  onViewChange: (mode: ViewMode) => void
  typeFilter?: TypeFilter
  onTypeFilterChange?: (t: TypeFilter) => void
  onAddClick?: () => void
  userName?: string
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  month?: string
  onMonthChange?: (value: string) => void
}) {
  const isListView = view === "list"

  const monthInputRef = useRef<HTMLInputElement | null>(null)

  const monthLabel = (() => {
    if (!month) return "Janeiro"
    const [y, m] = month.split("-").map(Number)
    const date = new Date(y, m - 1, 1)
    return date.toLocaleDateString("pt-BR", { month: "long" })
  })()

  const titles: Record<typeof view, string> = {
    grid: "Orçamento",
    dashboard: "Dashboard",
    list: "Gastos",
    settings: "Configurações",
  }

  return (
    <div className="flex flex-col gap-3 pl-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text md:text-[36px] md:font-semibold md:leading-[1.22em] md:text-g-green-dark">
          {titles[view]}
        </span>
        <div className="flex items-center gap-3 md:hidden">
          {userName && (
            <span className="text-[13px] font-medium text-g-muted">
              Olá, {userName}
            </span>
          )}
          <ViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-6">
        {isListView && (
          <>
            {onAddClick && (
              <button
                type="button"
                onClick={onAddClick}
                className="flex h-9 items-center justify-center rounded-full bg-g-black px-4 py-2 text-[14px] font-medium leading-[1.25em] text-g-white transition-opacity hover:opacity-90 md:h-10 md:w-[127px] md:text-[16px]"
              >
                Adicionar
              </button>
            )}
            <div className="hidden items-center gap-4 md:flex">
              <button
                type="button"
                onClick={() => monthInputRef.current?.showPicker?.()}
                className="flex items-center gap-2 rounded-full bg-g-bg px-[18px] py-2"
              >
                <Image src="/images/calendar.svg" alt="" width={20} height={20} />
                <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text capitalize">
                  {monthLabel}
                </span>
                <input
                  ref={monthInputRef}
                  type="month"
                  value={month}
                  onChange={(e) => onMonthChange?.(e.target.value)}
                  className="absolute h-0 w-0 opacity-0"
                  tabIndex={-1}
                />
              </button>

              <div className="flex items-center gap-2 rounded-full bg-g-bg px-[18px] py-2">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onTypeFilterChange?.(typeFilter === f.value ? "todos" : f.value)}
                    className={`text-[16px] font-medium leading-[1.25em] transition-colors ${
                      typeFilter === f.value
                        ? "text-g-green-text"
                        : "text-g-muted hover:text-g-green-text"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {onSearchQueryChange && (
                <div className="flex items-center gap-2 rounded-full bg-g-bg px-[14px] py-2">
                  <input
                    type="text"
                    placeholder="Buscar"
                    value={searchQuery ?? ""}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="w-[160px] bg-transparent text-[14px] font-medium leading-[1.25em] text-g-green-text placeholder:text-g-muted outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Apenas garante que o valor atual seja usado; filtro já é reativo
                      onSearchQueryChange(searchQuery ?? "")
                    }}
                    className="flex size-7 items-center justify-center rounded-full bg-g-green text-g-green-dark text-[13px] font-semibold"
                    aria-label="Buscar"
                  >
                    🔍
                  </button>
                </div>
              )}
            </div>

            {/* Filtros mobile */}
            <div className="flex items-center gap-2 overflow-x-auto md:hidden">
              <div className="flex items-center gap-1 rounded-full bg-g-bg px-3 py-1.5">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onTypeFilterChange?.(typeFilter === f.value ? "todos" : f.value)}
                    className={`whitespace-nowrap px-2 text-[13px] font-medium leading-[1.25em] transition-colors ${
                      typeFilter === f.value
                        ? "text-g-green-text"
                        : "text-g-muted hover:text-g-green-text"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="hidden items-center gap-3 md:flex">
          {userName && (
            <span className="text-[16px] font-medium text-g-muted">
              Olá, {userName}
            </span>
          )}
          <ViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}
