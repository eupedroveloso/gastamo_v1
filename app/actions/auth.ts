"use server"

import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

import { prisma } from "@/lib/prisma"
import { signIn, signOut } from "@/lib/auth"
import type { BudgetState } from "@/lib/dashboard-types"

type ActionResult = { error?: string; success?: boolean }

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Preencha email e senha" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email ou senha incorretos" }
    }
    throw err
  }
}

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const familyName = String(formData.get("familyName") ?? "").trim()

  if (!name || !email || !password || !familyName) {
    return { error: "Preencha todos os campos" }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" }
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  })
  if (existing) {
    return { error: "Este email já está cadastrado" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const family = await prisma.family.create({
    data: {
      name: familyName,
    },
  })

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      familyId: family.id,
    },
  })

  // Para novas famílias:
  // - membros: apenas o usuário dono da conta
  // - orçamentos: todos zerados
  // - categorias/cartões: começam vazios
  const zeroBudgets: BudgetState = { geral: 0, [name]: 0 }

  await prisma.appSettings.create({
    data: {
    familyId: family.id,
    members: [name],
    budgets: zeroBudgets,
    categories: [],
    cards: [],
  },
})

  return { success: true }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
