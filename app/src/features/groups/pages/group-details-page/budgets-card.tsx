import { PencilLine, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type BudgetItem = {
  amount: string
  id: string
  name: string
  overBudget: string
  overBudgetCents: number
  remaining: string
  spentCents: number
  spent: string
}

type BudgetsCardProps = {
  canEdit: boolean
  items: BudgetItem[]
  isDeletePending: boolean
  onCreate: () => void
  onDelete: (budgetId: string) => Promise<void>
  onEdit: (budgetId: string) => void
}

export function BudgetsCard({
  canEdit,
  items,
  isDeletePending,
  onCreate,
  onDelete,
  onEdit,
}: BudgetsCardProps) {
  return (
    <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Budgets</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">
            Track planned spend separately from who owes whom.
          </p>
        </div>
        {canEdit ? (
          <Button className="h-10 rounded-2xl" size="sm" onClick={onCreate} type="button">
            <Plus className="size-4" />
            Add
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-[24px] bg-secondary/70 px-4 py-4 text-sm text-muted-foreground sm:text-[15px]">
            No budgets yet. Add one when this group needs a spending limit or a shared fund.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(63,52,25,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-foreground sm:text-base">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">
                    Budget {item.amount} · Spent {item.spent}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground sm:text-[15px]">
                    {item.overBudgetCents > 0
                      ? `Over budget by ${item.overBudget}`
                      : `${item.remaining} left`}
                  </p>
                  {item.spentCents > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Linked expenses keep this budget locked from deletion.
                    </p>
                  ) : null}
                </div>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <Button
                      className="size-10 rounded-2xl"
                      size="icon"
                      variant="secondary"
                      onClick={() => onEdit(item.id)}
                      type="button"
                    >
                      <PencilLine className="size-4" />
                      <span className="sr-only">Edit budget</span>
                    </Button>
                    <Button
                      className="size-10 rounded-2xl"
                      disabled={isDeletePending || item.spentCents > 0}
                      size="icon"
                      variant="secondary"
                      onClick={() => onDelete(item.id)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete budget</span>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
