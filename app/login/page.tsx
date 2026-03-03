import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

type LoginPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const registeredParam = params?.registered
  const justRegistered =
    typeof registeredParam === "string" ? registeredParam === "1" : false

  return <LoginForm justRegistered={justRegistered} />
}
