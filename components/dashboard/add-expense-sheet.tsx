"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronDown, Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { ExpenseScope, ExpenseType, Responsible } from "@/lib/dashboard-types"

function formatDisplayValue(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return "R$ 0,00"
  const cents = parseInt(digits, 10)
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

function PillSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger className="h-auto w-full rounded-[32px] border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4 text-[16px] font-medium leading-[1.25em] text-g-green-text shadow-none data-[placeholder]:text-g-muted [&>svg]:hidden">
        <div className="flex w-full items-center justify-between">
          <SelectValue placeholder={label} />
          <ChevronDown className="size-4 shrink-0 text-g-muted" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AddExpenseSheet() {
  const {
    addSheetOpen,
    setAddSheetOpen,
    addSheetType,
    setAddSheetType,
    addExpense,
    updateExpense,
    editingExpense,
    clearEditingExpense,
    members,
    categories,
    cards,
  } = useDashboard()

  const now = new Date()
  const [rawValue, setRawValue] = useState("")
  const [description, setDescription] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [type, setType] = useState<ExpenseType>("avulso")
  const [scope, setScope] = useState<ExpenseScope>("member")
  const [responsible, setResponsible] = useState<Responsible | "">("")
  const [card, setCard] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(() => now.toISOString().slice(0, 10))
  const [time, setTime] = useState(
    () =>
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  )
  const [installmentCurrent, setInstallmentCurrent] = useState("")
  const [installmentTotal, setInstallmentTotal] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const descRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addSheetType) setType(addSheetType)
  }, [addSheetType])

  useEffect(() => {
    if (showDescription && descRef.current) {
      descRef.current.focus()
    }
  }, [showDescription])

  const resetForm = () => {
    const n = new Date()
    setRawValue("")
    setDescription("")
    setIdentifier("")
    setType("avulso")
    setScope("member")
    setResponsible("")
    setCard("")
    setCategory("")
    setDate(n.toISOString().slice(0, 10))
    setTime(
      `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`
    )
    setInstallmentCurrent("")
    setInstallmentTotal("")
    setShowDescription(false)
    setAddSheetType(null)
    clearEditingExpense()
  }

  const handleClose = () => {
    setAddSheetOpen(false)
    resetForm()
  }

  const numValue = parseInt(rawValue.replace(/\D/g, ""), 10) / 100 || 0

  const handleValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      setRawValue((prev) => prev.slice(0, -1))
      return
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault()
      setRawValue((prev) => prev + e.key)
    }
  }

  const isValid =
    numValue > 0 &&
    responsible &&
    card &&
    category &&
    description &&
    (type !== "parcelado" ||
      (installmentCurrent &&
        installmentTotal &&
        parseInt(installmentTotal, 10) >= parseInt(installmentCurrent, 10)))

  const isEditing = !!editingExpense

  useEffect(() => {
    if (editingExpense) {
      const cents = Math.round(editingExpense.value * 100)
      setRawValue(String(cents))
      setDescription(editingExpense.description)
      setIdentifier(editingExpense.identifier ?? "")
      setType(editingExpense.type)
      setScope(editingExpense.scope ?? "member")
      setResponsible(editingExpense.responsible as Responsible)
      setCard(editingExpense.card)
      setCategory(editingExpense.category)
      setDate(editingExpense.date)
      setTime(editingExpense.time)
      setInstallmentCurrent(
        editingExpense.installmentCurrent != null ? String(editingExpense.installmentCurrent) : ""
      )
      setInstallmentTotal(
        editingExpense.installmentTotal != null ? String(editingExpense.installmentTotal) : ""
      )
      setShowDescription(true)
    }
  }, [editingExpense])

  const handleSubmit = () => {
    if (!isValid) return
    const payload = {
      date,
      time,
      description,
      ...(identifier && { identifier }),
      value: numValue,
      scope,
      responsible: responsible as Responsible,
      card,
      category,
      type,
      ...(type === "parcelado" && {
        installmentCurrent: parseInt(installmentCurrent, 10) || 1,
        installmentTotal: parseInt(installmentTotal, 10) || 1,
      }),
    } as Omit<any, "id">

    if (editingExpense) {
      updateExpense(editingExpense.id, payload as any)
    } else {
      addExpense(payload as any)
    }
    handleClose()
  }

  if (!addSheetOpen) return null

  const TYPE_OPTIONS = [
    { value: "avulso", label: "Avulso" },
    { value: "fixo", label: "Fixo" },
    { value: "parcelado", label: "Parcelado" },
  ]

  const formattedDate = (() => {
    const d = new Date(date + "T12:00:00")
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative flex w-full max-w-md flex-col justify-between overflow-y-auto rounded-l-[56px] bg-white px-10 pb-8 pt-4 md:max-w-lg">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2 py-6">
            <span className="text-[16px] font-medium leading-[1.25em] text-g-green-text">
              {isEditing ? "Editar Gasto" : "Adicionar Gasto"}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="text-g-green-text transition-opacity hover:opacity-60"
              aria-label="Fechar"
            >
              <X className="size-[13px]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Value display */}
          <div className="border-b border-[#EDF0E7] px-2 pb-3.5">
            <input
              type="text"
              inputMode="numeric"
              value={formatDisplayValue(rawValue)}
              onKeyDown={handleValueKeyDown}
              onChange={() => {}}
              className="w-full bg-transparent text-[48px] font-semibold leading-[1.25em] text-g-green outline-none"
              autoFocus
            />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            {/* Descrição */}
            {showDescription ? (
              <div className="flex items-center rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4">
                <input
                  ref={descRef}
                  type="text"
                  placeholder="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-medium leading-[1.25em] text-g-green-text placeholder:text-g-muted outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDescription(true)}
                className="flex items-center justify-between rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4"
              >
                <span className="text-[16px] font-medium leading-[1.25em] text-g-muted">
                  {description || "Descrição"}
                </span>
                <ChevronDown className="size-4 text-g-muted" />
              </button>
            )}

            {/* Identificador da compra */}
            <div className="flex items-center rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4">
              <input
                type="text"
                placeholder="Identificador da compra"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent text-[16px] font-medium leading-[1.25em] text-g-green-text placeholder:text-g-muted outline-none"
              />
            </div>

            {/* Escopo do gasto: família ou membro */}
            <PillSelect
              label="Para quem é o gasto"
              value={scope}
              onValueChange={(v) => setScope((v as ExpenseScope) ?? "member")}
              options={[
                { value: "member", label: "Pessoal" },
                { value: "family", label: "Família" },
              ]}
            />

            {/* Tipo */}
            <PillSelect
              label="Tipo"
              value={type}
              onValueChange={(v) => setType(v as ExpenseType)}
              options={TYPE_OPTIONS}
            />

            {/* Responsável */}
            <PillSelect
              label="Responsável"
              value={responsible}
              onValueChange={(v) => setResponsible(v as Responsible)}
              options={members.map((m) => ({ value: m, label: m }))}
            />

            {/* Cartão */}
            <PillSelect
              label="Cartão"
              value={card}
              onValueChange={setCard}
              options={cards.map((c) => ({ value: c, label: c }))}
            />

            {/* Categoria */}
            <PillSelect
              label="Categoria"
              value={category}
              onValueChange={setCategory}
              options={categories.map((c) => ({ value: c, label: c }))}
            />

            {/* Data e Hora */}
            <div className="flex items-center justify-between rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4">
              <button
                type="button"
                onClick={() => dateRef.current?.showPicker?.()}
                className="text-[16px] font-medium leading-[1.25em] text-g-green-text"
              >
                {formattedDate} {time}
              </button>
              <Calendar className="size-[25px] text-g-green-text" strokeWidth={1.5} />
              <input
                ref={dateRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="invisible absolute size-0"
                tabIndex={-1}
              />
              <input
                ref={timeRef}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="invisible absolute size-0"
                tabIndex={-1}
              />
            </div>

            {/* Parcelas (se parcelado) */}
            {type === "parcelado" && (
              <div className="flex gap-3">
                <div className="flex flex-1 items-center rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Total parcelas"
                    value={installmentTotal}
                    onChange={(e) => {
                      setInstallmentTotal(e.target.value)
                      const total = parseInt(e.target.value, 10)
                      if (total && parseInt(installmentCurrent, 10) > total)
                        setInstallmentCurrent(String(total))
                    }}
                    className="w-full bg-transparent text-[16px] font-medium leading-[1.25em] text-g-green-text placeholder:text-g-muted outline-none"
                  />
                </div>
                {installmentTotal && parseInt(installmentTotal, 10) > 0 ? (
                  <PillSelect
                    label="Parcela"
                    value={installmentCurrent}
                    onValueChange={setInstallmentCurrent}
                    options={Array.from(
                      { length: parseInt(installmentTotal, 10) },
                      (_, i) => ({
                        value: String(i + 1),
                        label: `${i + 1}ª de ${installmentTotal}`,
                      })
                    )}
                  />
                ) : (
                  <div className="flex flex-1 items-center rounded-[32px] border border-[#EDF0E7] bg-[#EDF0E7] px-6 py-4">
                    <span className="text-[16px] font-medium leading-[1.25em] text-g-muted">
                      Parcela
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer – Inserir button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex items-center justify-between rounded-[32px] bg-g-green px-6 py-4 text-[20px] font-medium leading-[1.4em] text-g-green-dark transition-opacity disabled:opacity-40"
          >
            <span>{isEditing ? "Salvar" : "Inserir"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
