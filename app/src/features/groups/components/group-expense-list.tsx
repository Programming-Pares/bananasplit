import { EmptyState } from '@/components/common/empty-state'
import { Link } from 'react-router-dom'
import { ReceiptText } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

type GroupExpense = {
  amount: string
  dateLabel: string
  expenseId: string
  paidBy: string
  splitLabel: string
  title: string
}

type GroupExpenseListProps = {
  items: GroupExpense[]
}

export function GroupExpenseList({ items }: GroupExpenseListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        description="Add the first expense in this group to start tracking shared spending."
        icon={ReceiptText}
        title="No expenses yet"
      />
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link className="block" key={item.expenseId} to={`/expenses/${item.expenseId}`}>
          <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.dateLabel}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="text-base font-semibold text-foreground">{item.amount}</p>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{item.paidBy}</span>
                <span>{item.splitLabel}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
