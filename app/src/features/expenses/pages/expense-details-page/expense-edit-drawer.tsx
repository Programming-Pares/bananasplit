import { useState } from 'react'

import { BudgetSelector } from '@/components/budget/budget-selector'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useUpdateExpenseMutation } from '@/lib/queries/use-app-queries'
import { cn } from '@/lib/utils'

function formatAmountInput(amount: string) {
  return amount.replace(/[^\d.]/g, '').trim()
}

function parseAmountInput(amount: string) {
  return Number.parseFloat(formatAmountInput(amount) || '0')
}

type ExpenseDetails = {
  amount: string
  breakdown: Array<{ adjustmentCents: number }>
  budgetId: string | null
  budgets: Array<{
    amount: string
    amountCents: number
    id: string
    name: string
    overBudget: string
    overBudgetCents: number
    remaining: string
    remainingCents: number
    spent: string
    spentCents: number
  }>
  expenseId: string
  groupMembers: Array<{ id: string; name: string }>
  paidByMemberId: string
  participantIds: string[]
  title: string
}

type ExpenseEditDrawerProps = {
  expense: ExpenseDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseEditDrawer({
  expense,
  open,
  onOpenChange,
}: ExpenseEditDrawerProps) {
  const updateExpenseMutation = useUpdateExpenseMutation()
  const [title, setTitle] = useState(expense.title)
  const [amountInput, setAmountInput] = useState(formatAmountInput(expense.amount))
  const [budgetId, setBudgetId] = useState<string | null>(expense.budgetId)
  const [paidByMemberId, setPaidByMemberId] = useState(expense.paidByMemberId)
  const [participantIds, setParticipantIds] = useState<string[]>(expense.participantIds)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const parsedAmount = parseAmountInput(amountInput)

  const normalizedTitle = title.trim()
  const normalizedParticipantIds = [...new Set(participantIds)]
  const canSave =
    normalizedTitle.length > 0 &&
    parsedAmount > 0 &&
    paidByMemberId.length > 0 &&
    normalizedParticipantIds.length > 0
  const hasChanges =
    normalizedTitle !== expense.title ||
    Math.round(parsedAmount * 100) !== Math.round(parseAmountInput(expense.amount) * 100) ||
    budgetId !== expense.budgetId ||
    paidByMemberId !== expense.paidByMemberId ||
    normalizedParticipantIds.join(',') !== expense.participantIds.join(',')

  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Edit expense</DrawerTitle>
          <DrawerDescription>
            Update the title, amount, payer, and selected participants.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (!canSave || !hasChanges) {
              return
            }

            setErrorMessage(null)

            try {
              await updateExpenseMutation.mutateAsync({
                amountCents: Math.round(parsedAmount * 100),
                budgetId,
                expenseId: expense.expenseId,
                paidByMemberId,
                participantMemberIds: normalizedParticipantIds,
                title: normalizedTitle,
              })
              onOpenChange(false)
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : 'Unable to save expense changes.',
              )
            }
          }}
        >
          <div className="space-y-5 px-4 pb-2">
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="edit-expense-title"
              >
                Title
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="edit-expense-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="edit-expense-amount"
              >
                Amount
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="edit-expense-amount"
                inputMode="decimal"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Paid by</p>
              <div className="flex flex-wrap gap-2">
                {expense.groupMembers.map((member) => (
                  <button
                    key={member.id}
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-2 text-sm transition-colors',
                      paidByMemberId === member.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-white/80 text-foreground hover:bg-white',
                    )}
                    onClick={() => {
                      setPaidByMemberId(member.id)
                      setErrorMessage(null)
                    }}
                    type="button"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            <BudgetSelector
              amountCents={Math.round(parsedAmount * 100)}
              budgets={expense.budgets}
              selectedBudgetId={budgetId}
              onSelect={(nextBudgetId) => {
                setBudgetId(nextBudgetId)
                setErrorMessage(null)
              }}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Split with</p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-full border border-border bg-white/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white"
                    onClick={() => {
                      setParticipantIds(expense.groupMembers.map((member) => member.id))
                      setErrorMessage(null)
                    }}
                    type="button"
                  >
                    All members
                  </button>
                  <button
                    className="rounded-full border border-border bg-white/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white"
                    onClick={() => {
                      setParticipantIds(paidByMemberId ? [paidByMemberId] : [])
                      setErrorMessage(null)
                    }}
                    type="button"
                  >
                    Only payer
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {expense.groupMembers.map((member) => {
                  const active = participantIds.includes(member.id)

                  return (
                    <button
                      key={member.id}
                      className={cn(
                        'inline-flex items-center rounded-full border px-3 py-2 text-sm transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-white/80 text-foreground hover:bg-white',
                      )}
                      onClick={() => {
                        setErrorMessage(null)

                        if (active && participantIds.length === 1) {
                          return
                        }

                        setParticipantIds((current) =>
                          active
                            ? current.filter((item) => item !== member.id)
                            : [...current, member.id],
                        )
                      }}
                      type="button"
                    >
                      {member.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {expense.breakdown.some((item) => item.adjustmentCents > 0) ? (
              <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
                Existing adjustments will be preserved for members who remain selected
                in this edit.
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-[24px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={!canSave || !hasChanges || updateExpenseMutation.isPending}
              type="submit"
            >
              {updateExpenseMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
            <Button
              className="h-12 rounded-2xl"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
