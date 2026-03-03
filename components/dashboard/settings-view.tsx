"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { BudgetState } from "@/lib/dashboard-types"


export function SettingsView() {
  const {
    members,
    setMembers,
    initialBudgets,
    setInitialBudgets,
    categories,
    setCategories,
    cards,
    setCards,
  } = useDashboard()

  const [newMember, setNewMember] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newCard, setNewCard] = useState("")

  const handleAddMember = () => {
    const name = newMember.trim()
    if (!name || members.includes(name)) return
    setMembers([...members, name])
    setInitialBudgets((prev) => ({ ...prev, [name]: 0 }))
    setNewMember("")
  }

  const handleRemoveMember = (name: string) => {
    if (members.length <= 1) return
    setMembers(members.filter((m) => m !== name))
    setInitialBudgets((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleBudgetChange = (key: keyof BudgetState, value: number) => {
    setInitialBudgets((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddCategory = () => {
    const c = newCategory.trim()
    if (!c || categories.includes(c)) return
    setCategories([...categories, c])
    setNewCategory("")
  }

  const handleRemoveCategory = (c: string) => {
    setCategories(categories.filter((x) => x !== c))
  }

  const handleAddCard = () => {
    const c = newCard.trim()
    if (!c || cards.includes(c)) return
    setCards([...cards, c])
    setNewCard("")
  }

  const handleRemoveCard = (c: string) => {
    setCards(cards.filter((x) => x !== c))
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto md:gap-6">
      {/* Orçamentos */}
      <section className="rounded-3xl bg-g-bg p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-g-green-text">
          Orçamentos
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Label className="w-24 shrink-0">Família (geral)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0,00"
              value={initialBudgets.geral ?? 0}
              onChange={(e) => {
                const n = parseFloat(e.target.value) || 0
                handleBudgetChange("geral", n)
              }}
              className="max-w-full md:max-w-[180px]"
            />
          </div>
          {members.map((name) => (
            <div key={name} className="flex flex-wrap items-center gap-4">
              <Label className="w-24 shrink-0">{name}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                value={initialBudgets[name] ?? 0}
                onChange={(e) => {
                  const n = parseFloat(e.target.value) || 0
                  handleBudgetChange(name, n)
                }}
                className="max-w-full md:max-w-[180px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveMember(name)}
                disabled={members.length <= 1}
                className="text-g-green-text"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Integrantes da família */}
      <section className="rounded-3xl bg-g-bg p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-g-green-text">
          Integrantes da família
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Nome do integrante"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            className="max-w-full md:max-w-[200px]"
          />
          <Button
            type="button"
            onClick={handleAddMember}
            className="bg-g-green text-g-green-text hover:opacity-90"
          >
            Adicionar
          </Button>
        </div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {members.map((m) => (
            <li
              key={m}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-g-green-text"
            >
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* Categorias */}
      <section className="rounded-3xl bg-g-bg p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-g-green-text">
          Categorias de gasto
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Nova categoria"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="max-w-full md:max-w-[200px]"
          />
          <Button
            type="button"
            onClick={handleAddCategory}
            className="bg-g-green text-g-green-text hover:opacity-90"
          >
            Adicionar
          </Button>
        </div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-g-green-text"
            >
              {c}
              <button
                type="button"
                onClick={() => handleRemoveCategory(c)}
                className="ml-1 rounded-full p-0.5 text-g-muted hover:text-g-green-text"
                aria-label={`Remover ${c}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Cartões */}
      <section className="rounded-3xl bg-g-bg p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-g-green-text">
          Cartões
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Novo cartão"
            value={newCard}
            onChange={(e) => setNewCard(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
            className="max-w-full md:max-w-[200px]"
          />
          <Button
            type="button"
            onClick={handleAddCard}
            className="bg-g-green text-g-green-text hover:opacity-90"
          >
            Adicionar
          </Button>
        </div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {cards.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-g-green-text"
            >
              {c}
              <button
                type="button"
                onClick={() => handleRemoveCard(c)}
                className="ml-1 rounded-full p-0.5 text-g-muted hover:text-g-green-text"
                aria-label={`Remover ${c}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
