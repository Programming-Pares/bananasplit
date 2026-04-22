import { useState } from 'react'
import { Clock3, ReceiptText, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { RootPageHeader } from '@/components/common/root-page-header'
import { Card, CardContent } from '@/components/ui/card'
import { useActivityQuery } from '@/lib/queries/use-app-queries'

export function ActivityPage() {
  const { data } = useActivityQuery()
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'settlement' | 'system'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const filteredItems = (data ?? []).filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
  const orderedItems = sortOrder === 'newest' ? filteredItems : [...filteredItems].reverse()

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <div className="space-y-5">
        <RootPageHeader
          showNotifications
          showSearch
          subtitle="Money moves and local group history"
          title="Activity"
        />

        <div className="flex flex-wrap gap-2">
          {(['all', 'expense', 'settlement', 'system'] as const).map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm sm:text-[15px] ${
                typeFilter === item ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
              onClick={() => setTypeFilter(item)}
              type="button"
            >
              {item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
          <button
            className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground sm:text-[15px]"
            onClick={() => setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'))}
            type="button"
          >
            Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        <div className="space-y-3">
          {orderedItems.length === 0 ? (
            <EmptyState
              description="Expenses and settlements will appear here once you start using your groups."
              icon={ReceiptText}
              title="No activity yet"
            />
          ) : (
            orderedItems.map((item) => (
              <Card
                className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]"
                key={item.id}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                    {item.type === 'expense' ? (
                      <ReceiptText className="size-4" />
                    ) : item.type === 'settlement' ? (
                      <Wallet className="size-4" />
                    ) : (
                      <Clock3 className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-medium text-foreground sm:text-base">{item.groupName}</p>
                      <p className="text-xs text-muted-foreground sm:text-[13px]">{item.when}</p>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground sm:text-[15px]">{item.text}</p>
                    <p className="text-[15px] font-semibold text-foreground sm:text-base">{item.amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  )
}
