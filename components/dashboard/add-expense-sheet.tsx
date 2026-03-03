"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { useDashboard } from "@/components/dashboard/dashboard-context"
import type { ExpenseType, Responsible } from "@/lib/dashboard-types"

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  fixo: "Fixo",
  avulso: "Avulso",
  parcelado: "Compra parcelada",
}

export function AddExpenseSheet() {
  const { addSheetOpen, setAddSheetOpen, addSheetType, setAddSheetType, addExpense, members, categories, cards } =
    useDashboard()

  const now = new Date()
  const [date, setDate] = useState(() => now.toISOString().slice(0, 10))
  const [time, setTime] = useState(
    () => `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  )
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [responsible, setResponsible] = useState<Responsible | "">("")
  const [card, setCard] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<ExpenseType>("avulso")
  const [installmentCurrent, setInstallmentCurrent] = useState("")
  const [installmentTotal, setInstallmentTotal] = useState("")

  useEffect(() => {
    if (addSheetType) setType(addSheetType)
  }, [addSheetType])

  const resetForm = () => {
    const n = new Date()
    setDate(n.toISOString().slice(0, 10))
    setTime(`${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`)
    setDescription("")
    setValue("")
    setResponsible("")
    setCard("")
    setCategory("")
    setType("avulso")
    setInstallmentCurrent("")
    setInstallmentTotal("")
    setAddSheetType(null)
  }

  const handleOpenChange = (open: boolean) => {
    setAddSheetOpen(open)
    if (!open) resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseFloat(value.replace(",", "."))
    if (Number.isNaN(numValue) || numValue <= 0 || !responsible || !card || !category || !description)
      return
    addExpense({
      date,
      time,
      description,
      value: numValue,
      responsible: responsible as Responsible,
      card,
      category,
      type,
      ...(type === "parcelado" && {
        installmentCurrent: parseInt(installmentCurrent, 10) || 1,
        installmentTotal: parseInt(installmentTotal, 10) || 1,
      }),
    })
    handleOpenChange(false)
  }

  const isValid =
    value &&
    parseFloat(value.replace(",", ".")) > 0 &&
    responsible &&
    card &&
    category &&
    description &&
    (type !== "parcelado" ||
      (installmentCurrent &&
        installmentTotal &&
        parseInt(installmentTotal, 10) >= parseInt(installmentCurrent, 10)))

  return (
    <Sheet open={addSheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-g-green-text">Inserir novo gasto</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as ExpenseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">{EXPENSE_TYPE_LABELS.fixo}</SelectItem>
                <SelectItem value="avulso">{EXPENSE_TYPE_LABELS.avulso}</SelectItem>
                <SelectItem value="parcelado">{EXPENSE_TYPE_LABELS.parcelado}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Café da manhã"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="text"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select value={responsible} onValueChange={(v) => setResponsible(v as Responsible)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cartão</Label>
            <Select value={card} onValueChange={setCard}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "parcelado" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inst-total">Total de parcelas</Label>
                <Input
                  id="inst-total"
                  type="number"
                  min={1}
                  max={120}
                  value={installmentTotal}
                  onChange={(e) => {
                    const v = e.target.value
                    setInstallmentTotal(v)
                    const total = parseInt(v, 10)
                    if (total && parseInt(installmentCurrent, 10) > total)
                      setInstallmentCurrent(String(total))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Parcela atual</Label>
                {installmentTotal && parseInt(installmentTotal, 10) > 0 ? (
                  <Select
                    value={installmentCurrent}
                    onValueChange={setInstallmentCurrent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qual parcela?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: parseInt(installmentTotal, 10) },
                        (_, i) => i + 1
                      ).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}ª de {installmentTotal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    min={1}
                    placeholder="Informe o total primeiro"
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>
            </div>
          )}

          <SheetFooter className="mt-auto gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-g-black text-g-white hover:opacity-80"
            >
              Inserir gasto
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
