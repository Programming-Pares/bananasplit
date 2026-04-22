import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

type SummaryCardProps = {
  attention: string
  net: string
  openBalances: string
  owed: string
  owes: string
  scopeCountLabel: string
  scopeLabel: string
  totalExpenseCountLabel: string
  totalSpent: string
}

export function SummaryCard({
  attention,
  net,
  openBalances,
  owed,
  owes,
  scopeCountLabel,
  scopeLabel,
  totalExpenseCountLabel,
  totalSpent,
}: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,var(--color-banana-200),var(--color-banana-50)_60%,#fff)] shadow-[0_20px_40px_rgba(245,181,0,0.22)]">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-banana-900)]/70 sm:text-[15px]">
            Overall position
          </p>
          <p className="text-[2rem] font-semibold tracking-tight text-[var(--color-banana-950)] sm:text-[2.2rem]">
            {net}
          </p>
          <p className="text-sm leading-6 text-[var(--color-banana-900)]/70 sm:text-[15px]">
            {attention}
          </p>
        </div>
        <div className="rounded-[24px] bg-white/72 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Open balances
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground sm:text-[1.35rem]">{openBalances}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Total spent
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground sm:text-[1.35rem]">{totalSpent}</p>
            <p className="mt-1 text-xs text-muted-foreground">{totalExpenseCountLabel}</p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {scopeLabel}
            </p>
            <p className="mt-1 text-xl font-semibold text-foreground sm:text-[1.35rem]">{scopeCountLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/70 p-4">
            <ArrowDownLeft className="mb-3 size-4 text-orange-600" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              You owe
            </p>
            <p className="mt-1 text-xl font-semibold text-orange-700 sm:text-[1.35rem]">{owes}</p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-4">
            <ArrowUpRight className="mb-3 size-4 text-emerald-600" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              You are owed
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700 sm:text-[1.35rem]">{owed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
