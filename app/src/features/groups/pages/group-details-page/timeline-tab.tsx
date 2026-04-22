import { Clock3 } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'

type TimelineItem = {
  id: string
  text: string
  type: string
  when: string
}

export function TimelineTab({ items }: { items: TimelineItem[] }) {
  return items.length === 0 ? (
    <EmptyState
      description="Group actions, member changes, and money events will build a local timeline here."
      icon={Clock3}
      title="No history yet"
    />
  ) : (
    <>
      {items.map((item) => (
        <div className="rounded-[22px] bg-card/90 px-4 py-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]" key={item.id}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium text-foreground sm:text-base">{item.text}</p>
            <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
              {item.type}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">{item.when}</p>
        </div>
      ))}
    </>
  )
}
