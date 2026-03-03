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
    initialData = undefined
  }
  return (
    <DashboardProvider initialData={initialData}>{children}</DashboardProvider>
  )
}
