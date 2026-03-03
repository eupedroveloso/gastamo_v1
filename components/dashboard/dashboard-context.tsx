"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import { type Expense, type BudgetState, type ExpenseType, DEFAULT_BUDGETS, DEFAULT_CATEGORIES, DEFAULT_CARDS, DEFAULT_MEMBERS } from "@/lib/dashboard-types"
import type { DashboardInitialData } from "@/app/actions/dashboard"
import {
  addExpenseAction,
  removeExpenseAction,
  updateSettingsAction,
} from "@/app/actions/dashboard"

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function isInCurrentWeek(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00")
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return d >= weekStart && d <= weekEnd
}

function daysElapsedInCurrentWeek(): number {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const diff = now.getTime() - weekStart.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

interface DashboardContextValue {
  userName: string
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: string) => void
  members: string[]
  setMembers: (members: string[]) => void
  initialBudgets: BudgetState
  setInitialBudgets: (next: BudgetState) => void
  categories: string[]
  setCategories: (categories: string[]) => void
  cards: string[]
  setCards: (cards: string[]) => void
  availableBudget: BudgetState
  totalSpent: BudgetState
  averageDailyThisWeek: BudgetState
  addSheetOpen: boolean
  setAddSheetOpen: (open: boolean) => void
  addSheetType: ExpenseType | null
  setAddSheetType: (type: ExpenseType | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: DashboardInitialData
}) {
  const userName = initialData?.userName ?? ""
  const [expenses, setExpenses] = useState<Expense[]>(initialData?.expenses ?? [])
  const [members, setMembersState] = useState<string[]>(initialData?.members ?? DEFAULT_MEMBERS)
  const [initialBudgets, setInitialBudgetsState] = useState<BudgetState>(initialData?.initialBudgets ?? DEFAULT_BUDGETS)
  const [categories, setCategoriesState] = useState<string[]>(initialData?.categories ?? DEFAULT_CATEGORIES)
  const [cards, setCardsState] = useState<string[]>(initialData?.cards ?? DEFAULT_CARDS)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [addSheetType, setAddSheetType] = useState<ExpenseType | null>(null)

  const setMembers = useCallback((members: string[]) => {
    setMembersState(members)
    updateSettingsAction({ members }).then((result) => {
      if (result.success) setMembersState(result.settings.members)
    })
  }, [])

  const setCategories = useCallback((categories: string[]) => {
    setCategoriesState(categories)
    updateSettingsAction({ categories }).then((result) => {
      if (result.success) setCategoriesState(result.settings.categories)
    })
  }, [])

  const setCards = useCallback((cards: string[]) => {
    setCardsState(cards)
    updateSettingsAction({ cards }).then((result) => {
      if (result.success) setCardsState(result.settings.cards)
    })
  }, [])

  const setInitialBudgets = useCallback((next: BudgetState) => {
    setInitialBudgetsState(next)
    updateSettingsAction({ initialBudgets: next }).then((result) => {
      if (result.success) setInitialBudgetsState(result.settings.initialBudgets)
    })
  }, [])

  const totalSpent = useMemo(() => {
    const geral = expenses.reduce((s, e) => s + e.value, 0)
    const byMember: BudgetState = { geral }
    members.forEach((m) => {
      byMember[m] = expenses.filter((e) => e.responsible === m).reduce((s, e) => s + e.value, 0)
    })
    return byMember
  }, [expenses, members])

  const availableBudget = useMemo(() => {
    const result: BudgetState = {
      geral: (initialBudgets.geral ?? 0) - totalSpent.geral,
    }
    members.forEach((m) => {
      result[m] = (initialBudgets[m] ?? 0) - (totalSpent[m] ?? 0)
    })
    return result
  }, [initialBudgets, totalSpent, members])

  const weekExpenses = useMemo(() => {
    const geral = expenses.filter((e) => isInCurrentWeek(e.date)).reduce((s, e) => s + e.value, 0)
    const byMember: BudgetState = { geral }
    members.forEach((m) => {
      byMember[m] = expenses
        .filter((e) => e.responsible === m && isInCurrentWeek(e.date))
        .reduce((s, e) => s + e.value, 0)
    })
    return byMember
  }, [expenses, members])

  const daysInWeek = daysElapsedInCurrentWeek()
  const averageDailyThisWeek = useMemo(() => {
    const result: BudgetState = {
      geral: weekExpenses.geral / daysInWeek,
    }
    members.forEach((m) => {
      result[m] = (weekExpenses[m] ?? 0) / daysInWeek
    })
    return result
  }, [weekExpenses, daysInWeek, members])

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    addExpenseAction(expense).then((result) => {
      if (result.success) {
        setExpenses((prev) => [result.expense, ...prev])
      }
    })
  }, [])

  const removeExpense = useCallback((id: string) => {
    removeExpenseAction(id).then((result) => {
      if (result.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      userName,
      expenses,
      addExpense,
      removeExpense,
      members,
      setMembers,
      initialBudgets,
      setInitialBudgets,
      categories,
      setCategories,
      cards,
      setCards,
      availableBudget,
      totalSpent,
      averageDailyThisWeek,
      addSheetOpen,
      setAddSheetOpen,
      addSheetType,
      setAddSheetType,
    }),
    [
      userName,
      expenses,
      addExpense,
      removeExpense,
      members,
      initialBudgets,
      setInitialBudgets,
      categories,
      cards,
      availableBudget,
      totalSpent,
      averageDailyThisWeek,
      addSheetOpen,
      addSheetType,
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
