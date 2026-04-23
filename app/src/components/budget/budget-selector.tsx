import { cn } from '@/lib/utils'

type BudgetOption = {
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
}

type BudgetSelectorProps = {
  amountCents: number
  budgets: BudgetOption[]
  selectedBudgetId: string | null
  onSelect: (budgetId: string | null) => void
}

export function BudgetSelector({
  amountCents,
  budgets,
  selectedBudgetId,
  onSelect,
}: BudgetSelectorProps) {
  if (budgets.length === 0) {
    return null
  }

  const selectedBudget = selectedBudgetId
    ? budgets.find((budget) => budget.id === selectedBudgetId) ?? null
    : null
  const remainingAfterCents = selectedBudget
    ? selectedBudget.remainingCents - amountCents
    : null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground sm:text-[15px]">Budget</p>
      <div className="flex flex-wrap gap-2">
        <button
          className={cn(
            'rounded-full border px-3 py-2 text-sm transition-colors sm:text-[15px]',
            selectedBudgetId === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-white/80 text-foreground hover:bg-white',
          )}
          onClick={() => onSelect(null)}
          type="button"
        >
          No budget
        </button>
        {budgets.map((budget) => (
          <button
            key={budget.id}
            className={cn(
              'rounded-full border px-3 py-2 text-sm transition-colors sm:text-[15px]',
              selectedBudgetId === budget.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-white/80 text-foreground hover:bg-white',
            )}
            onClick={() => onSelect(budget.id)}
            type="button"
          >
            {budget.name}
          </button>
        ))}
      </div>

      {selectedBudget ? (
        <div className="rounded-[24px] border border-white/80 bg-white/80 px-4 py-3 text-sm text-foreground shadow-none sm:text-[15px]">
          <p className="font-medium">{selectedBudget.name}</p>
          <p className="mt-1 text-muted-foreground">
            Budget {selectedBudget.amount} · Spent {selectedBudget.spent}
          </p>
          <p className="mt-1 text-muted-foreground">
            Remaining before: {selectedBudget.remaining}
          </p>
          <p
            className={cn(
              'mt-1 font-medium',
              remainingAfterCents !== null && remainingAfterCents < 0
                ? 'text-destructive'
                : 'text-foreground',
            )}
          >
            {remainingAfterCents !== null && remainingAfterCents < 0
              ? `Over after this expense by ${formatBudgetAmount(Math.abs(remainingAfterCents))}`
              : `Remaining after this expense: ${formatBudgetAmount(remainingAfterCents ?? 0)}`}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function formatBudgetAmount(amountCents: number) {
  return `PHP ${new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)}`
}
