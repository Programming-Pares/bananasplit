import { ArrowRight, HandCoins, ReceiptText, Users } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function ActionCard({
  description,
  icon: Icon,
  onClick,
  title,
}: {
  description: string
  icon: typeof ReceiptText
  onClick?: () => void
  title: string
}) {
  return (
    <button
      className="flex w-full items-start gap-3 rounded-[28px] border border-white/80 bg-white/85 p-4 text-left shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
      onClick={onClick}
      type="button"
    >
      <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-foreground sm:text-base">{title}</p>
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
          {description}
        </p>
      </div>
    </button>
  )
}

export function Pill({
  active = false,
  showAvatar = false,
  children,
  onClick,
}: {
  active?: boolean
  children: string
  onClick?: () => void
  showAvatar?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors sm:text-[15px]',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/80 text-foreground hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {showAvatar ? (
        <Avatar className="size-6 border border-white/70">
          <AvatarFallback
            className={cn(
              'text-[10px] font-semibold',
              active
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {children.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : null}
      {children}
    </button>
  )
}

export function ActionChooser({
  onSelectExpense,
  onSelectGroup,
  onSelectSettlement,
}: {
  onSelectExpense: () => void
  onSelectGroup: () => void
  onSelectSettlement: () => void
}) {
  return (
    <div className="space-y-2.5 px-3.5 pb-2 sm:space-y-3 sm:px-4">
      <ActionCard
        description="Log who paid, split with members, and keep balances updated."
        icon={ReceiptText}
        onClick={onSelectExpense}
        title="Add expense"
      />
      <ActionCard
        description="Start a new household, trip, or barkada group."
        icon={Users}
        onClick={onSelectGroup}
        title="Create group"
      />
      <ActionCard
        description="Record a payment between members and reduce open balances."
        icon={HandCoins}
        onClick={onSelectSettlement}
        title="Settle up"
      />
    </div>
  )
}

export function EmptyGroupState() {
  return (
    <div className="px-3.5 pb-2 sm:px-4">
      <div className="rounded-[26px] border border-dashed border-border/80 bg-white/60 px-4 py-4 text-sm leading-6 text-muted-foreground sm:py-5 sm:text-[15px]">
        Create an active group first before adding an expense or settlement.
      </div>
    </div>
  )
}
