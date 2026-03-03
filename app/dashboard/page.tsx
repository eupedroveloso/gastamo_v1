"use client"

import { useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { FamilyCard } from "@/components/dashboard/family-card"
import { PersonCards } from "@/components/dashboard/person-cards"
import { TransactionsList } from "@/components/dashboard/transactions-list"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { SettingsView } from "@/components/dashboard/settings-view"
import { AddExpenseSheet } from "@/components/dashboard/add-expense-sheet"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { ExpenseType } from "@/lib/dashboard-types"
import type { ViewMode } from "@/components/dashboard/view-toggle"

type TypeFilter = ExpenseType | "todos"

export default function DashboardPage() {
  const [view, setView] = useState<ViewMode>("grid")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("avulso")
  const { setAddSheetOpen } = useDashboard()

  return (
    <div className="flex h-screen flex-col gap-4 bg-g-bg p-4 pt-14 md:pt-4">
      <AddExpenseSheet />

      {/* Desktop layout – single white card */}
      <div
        className={`hidden flex-1 flex-col overflow-hidden rounded-[32px] bg-g-white p-4 md:flex ${
          view === "list" ? "gap-8" : "gap-4"
        }`}
      >
        <TopBar
          view={view}
          onViewChange={setView}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onAddClick={() => setAddSheetOpen(true)}
        />

        {view === "grid" && (
          <div className="flex min-h-0 flex-1 gap-4">
            <div
              className="flex h-full w-[577px] shrink-0 [container-type:inline-size]"
            >
              <FamilyCard />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <PersonCards />
            </div>
          </div>
        )}

        {view === "list" && (
          <div className="flex flex-1 overflow-hidden">
            <TransactionsList typeFilter={typeFilter} />
          </div>
        )}

        {view === "dashboard" && (
          <div className="flex flex-1 overflow-hidden">
            <DashboardCharts />
          </div>
        )}

        {view === "settings" && (
          <div className="flex flex-1 overflow-hidden">
            <SettingsView />
          </div>
        )}
      </div>

      {/* Mobile layout – Figma 24:249: two stacked white cards */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto md:hidden">
        {/* Card 1: Orçamento */}
        <div className="flex flex-col gap-4 rounded-[32px] bg-g-white p-4">
          <TopBar
            view={view}
            onViewChange={setView}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onAddClick={() => setAddSheetOpen(true)}
          />

          {view === "grid" && (
            <div className="flex flex-col gap-4">
              <div className="flex w-full [container-type:inline-size]">
                <FamilyCard />
              </div>
              <PersonCards />
            </div>
          )}

          {view === "dashboard" && <DashboardCharts />}
          {view === "settings" && <SettingsView />}
        </div>

        {/* Card 2: Lançamentos (visible on grid and list views) */}
        {(view === "grid" || view === "list") && (
          <div className="flex flex-col gap-4 rounded-[32px] bg-g-white p-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text">
                Lançamentos
              </span>
              <button
                type="button"
                onClick={() => setAddSheetOpen(true)}
                className="flex items-center rounded-full bg-g-black px-4 py-2 text-[16px] font-medium leading-[1.25em] text-g-white"
              >
                Adicionar
              </button>
            </div>
            <TransactionsList typeFilter={typeFilter} />
          </div>
        )}
      </div>
    </div>
  )
}
