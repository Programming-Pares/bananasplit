import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type EmptyStateProps = {
  className?: string
  description: string
  icon: LucideIcon
  title: string
}

export function EmptyState({
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-dashed border-border/80 bg-white/60 px-5 py-8 text-center shadow-[0_12px_30px_rgba(63,52,25,0.04)]',
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
