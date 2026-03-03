"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { loginAction } from "@/app/actions/auth"

export function LoginForm({ justRegistered = false }: { justRegistered?: boolean }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(loginAction, {})

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard")
    }
  }, [state.success, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-[56px] bg-g-bg p-10">
        <h1 className="text-center text-[24px] font-semibold leading-[1.25em] text-g-green-dark">
          Entrar no Gastamo
        </h1>

        {justRegistered && !state.error && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-[14px] font-medium text-g-green-dark">
            Conta criada com sucesso! Faça login.
          </div>
        )}

        {state.error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[14px] font-medium text-g-green-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-[32px] border border-[#EDF0E7] bg-white px-6 py-3.5 text-[16px] font-medium text-g-green-text outline-none placeholder:text-g-muted focus:border-g-green-border"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[14px] font-medium text-g-green-text">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-[32px] border border-[#EDF0E7] bg-white px-6 py-3.5 text-[16px] font-medium text-g-green-text outline-none placeholder:text-g-muted focus:border-g-green-border"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex items-center justify-center rounded-[32px] bg-g-green px-6 py-4 text-[20px] font-medium leading-[1.4em] text-g-green-dark transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-[14px] text-g-green-text">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-g-green-dark underline underline-offset-2 hover:opacity-80"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}

