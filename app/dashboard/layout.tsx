import { redirect } from "next/navigation"

import { DashboardProvider } from "@/components/dashboard/dashboard-context"
import { getDashboardData } from "@/app/actions/dashboard"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let initialData
  try {
    initialData = await getDashboardData()
  } catch {
    // Se não estiver autenticado (ou houver erro ao ler a família),
    // garantimos que o usuário volte para a tela de login.
    redirect("/login")
  }
  return (
    <DashboardProvider initialData={initialData}>{children}</DashboardProvider>
  )
}
