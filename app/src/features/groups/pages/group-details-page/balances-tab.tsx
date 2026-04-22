import { Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'

type BalancesTabProps = {
  balanceItems: string[]
  settlementSuggestions: Array<{ fromId: string; suggestion: string; toId: string }>
}

export function BalancesTab({
  balanceItems,
  settlementSuggestions,
}: BalancesTabProps) {
  return (
    <>
      {settlementSuggestions.length > 0 ? (
        <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-[var(--color-banana-900)]" />
            <p className="text-[15px] font-medium text-foreground sm:text-base">Suggested settle-ups</p>
          </div>
          <div className="mt-3 space-y-2">
            {settlementSuggestions.map((item) => (
              <div className="rounded-[20px] bg-secondary/45 px-4 py-3 text-sm text-foreground sm:text-[15px]" key={`${item.fromId}-${item.toId}`}>
                {item.suggestion}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {balanceItems.length === 0 ? (
        <EmptyState
          description="Once expenses create debts between members, balance lines will appear here."
          icon={Wallet}
          title="No balances yet"
        />
      ) : (
        balanceItems.map((item) => (
          <div className="rounded-[22px] bg-card/90 px-4 py-4 text-sm text-muted-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] sm:text-[15px]" key={item}>
            {item}
          </div>
        ))
      )}
    </>
  )
}
