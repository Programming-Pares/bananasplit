import { useEffect, useState } from 'react'
import { PencilLine, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { ExpenseBreakdownCard } from '@/features/expenses/components/expense-breakdown-card'
import { ExpenseResultCard } from '@/features/expenses/components/expense-result-card'
import {
  useDeleteExpenseMutation,
  useExpenseQuery,
  useUpdateExpenseMutation,
} from '@/lib/queries/use-app-queries'
import { cn } from '@/lib/utils'

function formatAmountInput(amount: string) {
  return amount.replace('₱', '').replaceAll(',', '').trim()
}

export function ExpenseDetailsPage() {
  const navigate = useNavigate()
  const { expenseId = '' } = useParams()
  const { data: expense } = useExpenseQuery(expenseId)
  const updateExpenseMutation = useUpdateExpenseMutation()
  const deleteExpenseMutation = useDeleteExpenseMutation()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [paidByMemberId, setPaidByMemberId] = useState('')
  const [participantIds, setParticipantIds] = useState<string[]>([])

  useEffect(() => {
    if (!expense) {
      return
    }

    setTitle(expense.title)
    setAmountInput(formatAmountInput(expense.amount))
    setPaidByMemberId(expense.paidByMemberId)
    setParticipantIds(expense.participantIds)
  }, [expense])

  if (!expense) {
    return null
  }

  const canSave =
    title.trim().length > 0 &&
    Number.parseFloat(amountInput) > 0 &&
    paidByMemberId.length > 0 &&
    participantIds.length > 0

  return (
    <MobileShell>
      <ScreenHeader backHref={`/groups/${expense.groupId}`} title="Expense details" />

      <div className="space-y-4">
        <Card className="border-0 bg-[linear-gradient(160deg,#fff8da,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground sm:text-[15px]">{expense.date}</p>
              <h2 className="mt-1 text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.2rem]">
                {expense.title}
              </h2>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-banana-950)] sm:text-[1.7rem]">
                {expense.amount}
              </p>
            </div>
            <div className="grid gap-3 rounded-[26px] bg-white/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Paid by
                </p>
                <p className="mt-1 text-sm text-foreground sm:text-[15px]">{expense.paidBy}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Split between
                </p>
                <p className="mt-1 text-sm text-foreground sm:text-[15px]">{expense.participants.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExpenseBreakdownCard items={expense.breakdown} />
        <ExpenseResultCard items={expense.result} />

        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12 rounded-2xl" variant="secondary" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button className="h-12 rounded-2xl" onClick={() => setIsEditOpen(true)}>
            <PencilLine className="size-4" />
            Edit split
          </Button>
        </div>
      </div>

      <Drawer direction="bottom" open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Edit expense</DrawerTitle>
            <DrawerDescription>Update the title, amount, payer, and selected participants.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 px-4 pb-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground" htmlFor="edit-expense-title">
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
              <label className="block text-sm font-medium text-foreground" htmlFor="edit-expense-amount">
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
                    onClick={() => setPaidByMemberId(member.id)}
                    type="button"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Split with</p>
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
                Existing adjustments will be preserved for members who remain selected in this edit.
              </div>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={!canSave || updateExpenseMutation.isPending}
              onClick={async () => {
                await updateExpenseMutation.mutateAsync({
                  amountCents: Math.round(Number.parseFloat(amountInput) * 100),
                  expenseId: expense.expenseId,
                  paidByMemberId,
                  participantMemberIds: participantIds,
                  title,
                })
                setIsEditOpen(false)
              }}
              type="button"
            >
              Save changes
            </Button>
            <Button className="h-12 rounded-2xl" onClick={() => setIsEditOpen(false)} type="button" variant="secondary">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="bottom" open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Delete expense</DrawerTitle>
            <DrawerDescription>This will remove the expense from balances, group lists, and notifications.</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={deleteExpenseMutation.isPending}
              onClick={async () => {
                await deleteExpenseMutation.mutateAsync({
                  expenseId: expense.expenseId,
                })
                navigate(`/groups/${expense.groupId}`)
              }}
              type="button"
              variant="destructive"
            >
              Delete expense
            </Button>
            <Button className="h-12 rounded-2xl" onClick={() => setIsDeleteOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileShell>
  )
}
