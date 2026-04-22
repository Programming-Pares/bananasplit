import { Coins, Plus } from 'lucide-react'

import { formatAmountDisplay } from '@/features/quick-actions/components/calculator-amount'

type Adjustment = {
  amountCents: number
  id: string
  memberId: string
}

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value / 100)
}

type ExpenseAdjustmentsPanelProps = {
  amountCents: number
  amountInput: string
  expenseAdjustments: Adjustment[]
  expenseParticipantIds: string[]
  memberNameMap: Map<string, string>
  totalAdjustments: number
  onOpenAdjustment: () => void
}

export function ExpenseAdjustmentsPanel({
  amountCents,
  amountInput,
  expenseAdjustments,
  expenseParticipantIds,
  memberNameMap,
  totalAdjustments,
  onOpenAdjustment,
}: ExpenseAdjustmentsPanelProps) {
  return (
    <>
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground sm:text-[15px]">Adjustments</p>
          <button
            className="flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
            onClick={onOpenAdjustment}
            type="button"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {expenseAdjustments.length > 0 ? (
          <div className="space-y-2">
            {expenseAdjustments.map((adjustment) => (
              <div
                className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none sm:text-[15px]"
                key={adjustment.id}
              >
                <span className="font-medium">
                  {memberNameMap.get(adjustment.memberId) ?? adjustment.memberId}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrencyFromCents(adjustment.amountCents)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground sm:text-[15px]">
            No adjustments yet.
          </div>
        )}
      </div>

      <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-[15px]">
          <Coins className="size-4 text-[var(--color-banana-900)]" />
          Preview
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {expenseParticipantIds.length} member
          {expenseParticipantIds.length === 1 ? '' : 's'} selected. Current amount is{' '}
          {formatAmountDisplay(amountInput)}.
        </p>
        {totalAdjustments > amountCents ? (
          <p className="mt-2 text-sm text-destructive sm:text-[15px]">
            Adjustments cannot exceed the total amount.
          </p>
        ) : null}
      </div>
    </>
  )
}
