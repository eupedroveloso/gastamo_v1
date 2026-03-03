"use client"

import Image from "next/image"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { Expense, ExpenseType } from "@/lib/dashboard-types"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/* Figma 2007-303: data "23 JAN 2025" (Caption/md) */
function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  const day = d.getDate()
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function getAvatarForResponsible(responsible: string, members: string[]) {
  const i = members.indexOf(responsible)
  return i === 0 ? "/images/avatar-pedro.png" : "/images/avatar-leticia.png"
}

/* Card lançamento – Figma 29:30, borderRadius 24px, fill #FFFFFF, padding 16px */
function TransactionRow({ expense, members }: { expense: Expense; members: string[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 rounded-[24px] bg-g-white px-6 py-4 md:flex">
        <div className="flex w-[161px] shrink-0 items-center gap-6">
          <div
            className="relative size-[43px] shrink-0 overflow-hidden rounded-full"
            style={{ border: "2.6875px solid #88DB31" }}
          >
            <Image
              src={getAvatarForResponsible(expense.responsible, members)}
              alt={expense.responsible}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[16px] font-normal leading-[1.75em] text-g-green-text">
            {expense.description}
          </span>
        </div>
        <div className="w-[101px] shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          {formatDate(expense.date)}
        </div>
        <div className="w-[110px] shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          {expense.card}
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center rounded-2xl bg-[#E7EBE7] px-3 py-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
            {expense.category}
          </span>
        </div>
        <div className="w-[137px] shrink-0 text-right text-[16px] font-medium leading-[1.25em] text-g-green-text">
          R$ {formatCurrency(expense.value)}
        </div>
      </div>

      {/* Mobile – Figma 24:249 card layout */}
      <div className="flex items-center justify-between gap-3 rounded-[24px] bg-g-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <div
            className="relative size-[43px] shrink-0 overflow-hidden rounded-full"
            style={{ border: "2.6875px solid #88DB31" }}
          >
            <Image
              src={getAvatarForResponsible(expense.responsible, members)}
              alt={expense.responsible}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-normal leading-[1.75em] text-g-green-text">
              {expense.description}
            </span>
            <span className="text-[12px] font-normal leading-[1.33em] text-g-green-sub">
              HOJE {expense.time}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text">
            R$ {formatCurrency(expense.value)}
          </span>
        </div>
      </div>
    </>
  )
}

export function TransactionsList({
  typeFilter = "todos",
}: {
  typeFilter?: ExpenseType | "todos"
}) {
  const { expenses, members } = useDashboard()

  const filtered = typeFilter === "todos" ? expenses : expenses.filter((e) => e.type === typeFilter)

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Cabeçalho – Figma Frame 14, Caption/md, gap 16px (desktop only) */}
      <div className="hidden items-center justify-between gap-4 pl-2 pr-0 md:flex">
        <span className="w-[161px] shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          Quem
        </span>
        <span className="w-[101px] shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          Quando
        </span>
        <span className="w-[110px] shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          Cartão
        </span>
        <span className="min-w-0 shrink-0 text-[16px] font-normal leading-[1.75em] text-g-green-text">
          Categoria
        </span>
        <span className="w-[137px] shrink-0 text-right text-[16px] font-normal leading-[1.75em] text-g-green-text">
          Valor
        </span>
      </div>

      {/* Lista de cards + divisores – Figma divisor #F4F5F2 1px */}
      <div className="flex flex-col gap-px overflow-y-auto">
        {sorted.map((expense, i) => (
          <div key={expense.id} className="w-full">
            <TransactionRow expense={expense} members={members} />
            {i < sorted.length - 1 && (
              <div className="h-px w-full bg-g-divider" role="separator" aria-hidden />
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="py-12 text-center text-[16px] leading-[1.75em] text-g-muted">
            Nenhum lançamento encontrado
          </p>
        )}
      </div>
    </div>
  )
}
