export type ExpenseType = "fixo" | "avulso" | "parcelado"

export type Responsible = string

export interface Expense {
  id: string
  date: string
  time: string
  description: string
  identifier?: string
  value: number
  responsible: Responsible
  card: string
  category: string
  type: ExpenseType
  installmentCurrent?: number
  installmentTotal?: number
}

export interface BudgetState {
  geral: number
  [memberKey: string]: number
}

// Valores padrão usados apenas como fallback em casos excepcionais.
// Para novas famílias, usamos dados dinâmicos criados no registro.
export const DEFAULT_MEMBERS: string[] = []
export const DEFAULT_BUDGETS: BudgetState = {
  geral: 0,
}

export const DEFAULT_CATEGORIES: string[] = []

export const DEFAULT_CARDS: string[] = []

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "1",
    date: "2025-03-02",
    time: "10:45",
    description: "Café da manhã",
    value: 24.97,
    responsible: "Pedro",
    card: "Nubank",
    category: "Alimentação",
    type: "avulso",
  },
  {
    id: "2",
    date: "2025-03-02",
    time: "12:16",
    description: "Almoço",
    value: 45.9,
    responsible: "Pedro",
    card: "Nubank",
    category: "Alimentação",
    type: "avulso",
  },
  {
    id: "3",
    date: "2025-03-02",
    time: "19:45",
    description: "Jantar",
    value: 58.9,
    responsible: "Letícia",
    card: "Itaú",
    category: "Alimentação",
    type: "avulso",
  },
  {
    id: "4",
    date: "2025-03-02",
    time: "20:35",
    description: "Abastecimento do carro",
    value: 250.0,
    responsible: "Letícia",
    card: "Itaú",
    category: "Transporte",
    type: "avulso",
  },
  {
    id: "5",
    date: "2025-03-02",
    time: "20:35",
    description: "Abastecimento do carro",
    value: 250.0,
    responsible: "Pedro",
    card: "Nubank",
    category: "Transporte",
    type: "avulso",
  },
]
