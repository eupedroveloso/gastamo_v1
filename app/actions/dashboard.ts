"use server"

import { prisma } from "@/lib/prisma"
import type { BudgetState, Expense } from "@/lib/dashboard-types"
import {
  DEFAULT_BUDGETS,
  DEFAULT_CATEGORIES,
  DEFAULT_CARDS,
  DEFAULT_MEMBERS,
} from "@/lib/dashboard-types"

const SETTINGS_ID = "default"

function mapExpenseFromDb(row: {
  id: string
  date: string
  time: string
  description: string
  value: unknown
  responsible: string
  card: string
  category: string
  type: string
  installmentCurrent: number | null
  installmentTotal: number | null
}): Expense {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    description: row.description,
    value: Number(row.value),
    responsible: row.responsible,
    card: row.card,
    category: row.category,
    type: row.type as Expense["type"],
    ...(row.installmentCurrent != null && { installmentCurrent: row.installmentCurrent }),
    ...(row.installmentTotal != null && { installmentTotal: row.installmentTotal }),
  }
}

export type DashboardInitialData = {
  expenses: Expense[]
  members: string[]
  initialBudgets: BudgetState
  categories: string[]
  cards: string[]
}

export async function getDashboardData(): Promise<DashboardInitialData> {
  const [expenses, settings] = await Promise.all([
    prisma.expense.findMany({ orderBy: { createdAt: "desc" } }),
    getSettings(),
  ])
  return {
    expenses: expenses.map(mapExpenseFromDb),
    members: settings.members,
    initialBudgets: settings.initialBudgets,
    categories: settings.categories,
    cards: settings.cards,
  }
}

export async function getExpenses(): Promise<Expense[]> {
  const rows = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
  })
  return rows.map(mapExpenseFromDb)
}

export type AddExpenseResult =
  | { success: true; expense: Expense }
  | { success: false; error: string }

export async function addExpenseAction(
  payload: Omit<Expense, "id">
): Promise<AddExpenseResult> {
  try {
    const row = await prisma.expense.create({
      data: {
        date: payload.date,
        time: payload.time,
        description: payload.description,
        value: payload.value,
        responsible: payload.responsible,
        card: payload.card,
        category: payload.category,
        type: payload.type,
        installmentCurrent: payload.installmentCurrent ?? null,
        installmentTotal: payload.installmentTotal ?? null,
      },
    })
    return { success: true, expense: mapExpenseFromDb(row) }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar despesa"
    return { success: false, error: message }
  }
}

export type RemoveExpenseResult =
  | { success: true }
  | { success: false; error: string }

export async function removeExpenseAction(id: string): Promise<RemoveExpenseResult> {
  try {
    await prisma.expense.delete({ where: { id } })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao remover despesa"
    return { success: false, error: message }
  }
}

async function getSettings(): Promise<{
  members: string[]
  initialBudgets: BudgetState
  categories: string[]
  cards: string[]
}> {
  let row = await prisma.appSettings.findUnique({
    where: { id: SETTINGS_ID },
  })
  if (!row) {
    await prisma.appSettings.create({
      data: {
        id: SETTINGS_ID,
        members: DEFAULT_MEMBERS,
        budgets: DEFAULT_BUDGETS,
        categories: DEFAULT_CATEGORIES,
        cards: DEFAULT_CARDS,
      },
    })
    return {
      members: DEFAULT_MEMBERS,
      initialBudgets: DEFAULT_BUDGETS,
      categories: DEFAULT_CATEGORIES,
      cards: DEFAULT_CARDS,
    }
  }
  return {
    members: row.members as string[],
    initialBudgets: row.budgets as BudgetState,
    categories: row.categories as string[],
    cards: row.cards as string[],
  }
}

export async function getSettingsAction(): Promise<{
  members: string[]
  initialBudgets: BudgetState
  categories: string[]
  cards: string[]
}> {
  return getSettings()
}

export type UpdateSettingsPayload = {
  members?: string[]
  initialBudgets?: BudgetState
  categories?: string[]
  cards?: string[]
}

export type UpdateSettingsResult =
  | { success: true; settings: { members: string[]; initialBudgets: BudgetState; categories: string[]; cards: string[] } }
  | { success: false; error: string }

export async function updateSettingsAction(
  payload: UpdateSettingsPayload
): Promise<UpdateSettingsResult> {
  try {
    const current = await getSettings()
    const members = payload.members ?? current.members
    const initialBudgets = payload.initialBudgets ?? current.initialBudgets
    const categories = payload.categories ?? current.categories
    const cards = payload.cards ?? current.cards

    await prisma.appSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { members, budgets: initialBudgets, categories, cards },
      create: {
        id: SETTINGS_ID,
        members,
        budgets: initialBudgets,
        categories,
        cards,
      },
    })
    return {
      success: true,
      settings: { members, initialBudgets, categories, cards },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar configurações"
    return { success: false, error: message }
  }
}
