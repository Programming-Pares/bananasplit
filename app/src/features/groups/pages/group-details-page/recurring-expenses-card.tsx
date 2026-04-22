import { PauseCircle, PlayCircle, Plus, Repeat } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type RecurringExpenseItem = {
  amount: string
  frequencyLabel: string
  id: string
  isPaused: boolean
  participantCount: number
  title: string
}

type RecurringExpensesCardProps = {
  canEdit: boolean
  isCreateNowPending: boolean
  isPausePending: boolean
  items: RecurringExpenseItem[]
  onCreateNew: () => void
  onCreateNow: (recurringExpenseId: string) => void
  onTogglePaused: (recurringExpenseId: string, isPaused: boolean) => void
}

export function RecurringExpensesCard({
  canEdit,
  isCreateNowPending,
  isPausePending,
  items,
  onCreateNew,
  onCreateNow,
  onTogglePaused,
}: RecurringExpensesCardProps) {
  return (
    <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-foreground sm:text-base">Recurring expenses</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">Keep regular group costs ready to reuse.</p>
        </div>
        <Button
          className="rounded-2xl"
          disabled={!canEdit}
          onClick={onCreateNew}
          type="button"
          variant="secondary"
        >
          <Repeat className="size-4" />
          Add recurring
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyState
            className="border-0 bg-secondary/35 py-6 shadow-none"
            description="Set up a weekly or monthly template for rent, bills, or subscriptions."
            icon={Repeat}
            title="No recurring expenses yet"
          />
        ) : (
          items.map((item) => (
            <div className="rounded-[22px] bg-secondary/35 px-4 py-4" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-medium text-foreground sm:text-base">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    {item.frequencyLabel} · {item.amount} · {item.participantCount} people
                  </p>
                </div>
                <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-secondary-foreground">
                  {item.isPaused ? 'Paused' : 'Active'}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="rounded-full px-4"
                  disabled={isCreateNowPending || item.isPaused || !canEdit}
                  onClick={() => onCreateNow(item.id)}
                  type="button"
                  variant="secondary"
                >
                  <Plus className="size-4" />
                  Create now
                </Button>
                <Button
                  className="rounded-full px-4"
                  disabled={isPausePending}
                  onClick={() => onTogglePaused(item.id, !item.isPaused)}
                  type="button"
                  variant="secondary"
                >
                  {item.isPaused ? <PlayCircle className="size-4" /> : <PauseCircle className="size-4" />}
                  {item.isPaused ? 'Resume' : 'Pause'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
