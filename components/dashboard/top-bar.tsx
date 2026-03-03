"use client"

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
}: {
  view: ViewMode
  onViewChange: (mode: ViewMode) => void
  typeFilter?: TypeFilter
  onTypeFilterChange?: (t: TypeFilter) => void
  onAddClick?: () => void
}) {
  const isListView = view === "list"

  const titles: Record<typeof view, string> = {
    grid: "Gastei",
    dashboard: "Dashboard",
    list: "Lançamentos",
    settings: "Configurações",
  }

  return (
    <div className="flex flex-col gap-3 pl-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text md:text-[36px] md:font-semibold md:leading-[1.22em]">
          {titles[view]}
        </span>
        <div className="md:hidden">
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
                className="flex h-9 items-center justify-center rounded-full bg-g-green px-4 py-2 text-[14px] font-medium leading-[1.25em] text-g-green-text transition-opacity hover:opacity-90 md:h-10 md:w-[127px] md:text-[16px]"
              >
                Adicionar
              </button>
            )}
            <div className="hidden items-center gap-8 md:flex">
              <div className="flex items-center gap-2 rounded-full bg-g-bg px-[18px] py-2">
                <Image src="/images/calendar.svg" alt="" width={20} height={20} />
                <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text">
                  Janeiro
                </span>
              </div>

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

        <div className="hidden md:block">
          <ViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}
