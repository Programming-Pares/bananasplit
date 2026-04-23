import { useState } from 'react'
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
import { ExpenseBreakdownCard } from '@/features/expenses/components/expense-breakdown-card'
import { ExpenseEditDrawer } from '@/features/expenses/pages/expense-details-page/expense-edit-drawer'
import { ExpenseResultCard } from '@/features/expenses/components/expense-result-card'
import {
  useDeleteExpenseMutation,
  useExpenseQuery,
} from '@/lib/queries/use-app-queries'

export function ExpenseDetailsPage() {
  const { expenseId = '' } = useParams()
  const { data: expense } = useExpenseQuery(expenseId)

  if (!expense) {
    return null
  }

  const expenseStateKey = [
    expense.expenseId,
    expense.title,
    expense.amount,
    expense.budgetId ?? '',
    expense.paidByMemberId,
    expense.participantIds.join(','),
    expense.breakdown.map((item) => `${item.memberId}:${item.adjustmentCents}:${item.amount}`).join('|'),
  ].join('::')

  return <ExpenseDetailsPageContent key={expenseStateKey} expense={expense} />
}

function ExpenseDetailsPageContent({
  expense,
}: {
  expense: NonNullable<ReturnType<typeof useExpenseQuery>['data']>
}) {
  const navigate = useNavigate()
  const deleteExpenseMutation = useDeleteExpenseMutation()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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
                <p className="mt-1 text-sm text-foreground sm:text-[15px]">
                  {expense.participants.join(', ')}
                </p>
              </div>
              {expense.budgetName ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Budget
                  </p>
                  <p className="mt-1 text-sm text-foreground sm:text-[15px]">
                    {expense.budgetName}
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <ExpenseBreakdownCard items={expense.breakdown} />
        <ExpenseResultCard items={expense.result} />

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 rounded-2xl"
            variant="secondary"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button className="h-12 rounded-2xl" onClick={() => setIsEditOpen(true)}>
            <PencilLine className="size-4" />
            Edit split
          </Button>
        </div>
      </div>

      <ExpenseEditDrawer
        key={`${expense.expenseId}:${expense.title}:${expense.amount}:${expense.budgetId ?? ''}:${expense.paidByMemberId}:${expense.participantIds.join(',')}`}
        expense={expense}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <Drawer direction="bottom" open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Delete expense</DrawerTitle>
            <DrawerDescription>
              This will remove the expense from balances, group lists, and notifications.
            </DrawerDescription>
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
            <Button
              className="h-12 rounded-2xl"
              onClick={() => setIsDeleteOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileShell>
  )
}
