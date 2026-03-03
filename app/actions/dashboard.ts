"use server"

import { prisma } from "@/lib/prisma"
import type { BudgetState, Expense } from "@/lib/dashboard-types"
import { DEFAULT_BUDGETS, DEFAULT_CATEGORIES, DEFAULT_CARDS, DEFAULT_MEMBERS } from "@/lib/dashboard-types"
import { auth, getRequiredFamilyId } from "@/lib/auth"

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
  userName: string
}

export async function getDashboardData(): Promise<DashboardInitialData> {
  const familyId = await getRequiredFamilyId()
  const session = await auth()
  const userName = session?.user?.name ?? ""

  const [expenses, settings] = await Promise.all([
    prisma.expense.findMany({
      where: { familyId },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(familyId),
  ])
  return {
    expenses: expenses.map(mapExpenseFromDb),
    members: settings.members,
    initialBudgets: settings.initialBudgets,
    categories: settings.categories,
    cards: settings.cards,
    userName,
  }
}

export async function getExpenses(): Promise<Expense[]> {
  const familyId = await getRequiredFamilyId()
  const rows = await prisma.expense.findMany({
    where: { familyId },
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
    const familyId = await getRequiredFamilyId()
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
        familyId,
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
    const familyId = await getRequiredFamilyId()
    await prisma.expense.deleteMany({ where: { id, familyId } })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao remover despesa"
    return { success: false, error: message }
  }
}

async function getSettings(
  familyId: string
): Promise<{
  members: string[]
  initialBudgets: BudgetState
  categories: string[]
  cards: string[]
}> {
  let row = await prisma.appSettings.findUnique({
    where: { familyId },
  })
  if (!row) {
    // Fallback extremamente raro: família sem AppSettings.
    // Criamos um registro mínimo, sem membros/cartões/categorias e orçamentos zerados.
    row = await prisma.appSettings.create({
      data: {
        familyId,
        members: DEFAULT_MEMBERS,
        budgets: DEFAULT_BUDGETS,
        categories: DEFAULT_CATEGORIES,
        cards: DEFAULT_CARDS,
      },
    })
    return {
      members: row.members as string[],
      initialBudgets: row.budgets as BudgetState,
      categories: row.categories as string[],
      cards: row.cards as string[],
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
  const familyId = await getRequiredFamilyId()
  return getSettings(familyId)
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

export type ResetFamilyDataResult = { success: true } | { success: false; error: string }

export async function updateSettingsAction(
  payload: UpdateSettingsPayload
): Promise<UpdateSettingsResult> {
  try {
    const familyId = await getRequiredFamilyId()
    const current = await getSettings(familyId)
    const members = payload.members ?? current.members
    const initialBudgets = payload.initialBudgets ?? current.initialBudgets
    const categories = payload.categories ?? current.categories
    const cards = payload.cards ?? current.cards

    await prisma.appSettings.upsert({
      where: { familyId },
      update: { members, budgets: initialBudgets, categories, cards },
      create: {
        familyId,
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

export async function resetFamilyDataAction(): Promise<ResetFamilyDataResult> {
  try {
    const familyId = await getRequiredFamilyId()

    await prisma.expense.deleteMany({ where: { familyId } })

    const row = await prisma.appSettings.findUnique({ where: { familyId } })
    if (row) {
      const members = row.members as string[]
      const zeroBudgets: BudgetState = { geral: 0 }
      members.forEach((m) => {
        zeroBudgets[m] = 0
      })
      await prisma.appSettings.update({
        where: { familyId },
        data: { budgets: zeroBudgets },
      })
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao resetar dados"
    return { success: false, error: message }
  }
}
